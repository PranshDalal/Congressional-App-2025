from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import umap
from sklearn.cluster import DBSCAN

analysis_bp = Blueprint('analysis', __name__)

def fetch_user_sessions(user_id):
    db = firestore.client()
    sessions_ref = db.collection(f'users/{user_id}/sessions')
    sessions = sessions_ref.stream()
    session_list = [doc.to_dict() for doc in sessions]
    return pd.DataFrame(session_list) if session_list else None

def preprocess_data(df):
    numeric_features = ['focus_rating', 'noise_level', 'light_level', 'motion_level']
    categorical_features = ['headphones', 'ventilation']

    for col in numeric_features:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df['headphones'] = df['headphones'].astype(float)

    if 'ventilation' in df.columns:
        df['ventilation'] = df['ventilation'].astype(str)
        df['ventilation'] = df['ventilation'].astype('category').cat.codes.replace(-1, np.nan)  # -1 means NaN

    feature_cols = numeric_features + categorical_features
    df_featured = df[feature_cols].copy()

    df_featured.dropna(inplace=True)

    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df_featured)

    return scaled_data, df_featured.index

@analysis_bp.route('/clusters/<user_id>', methods=['GET'])
def get_clusters(user_id):
    db = firestore.client()
    analysis_ref = db.collection(f'users/{user_id}/analysis').document('clusters')
    cluster_data = analysis_ref.get()

    if not cluster_data.exists:
        return jsonify({'error': 'No analysis data found for this user.'}), 404

    return jsonify(cluster_data.to_dict()), 200


@analysis_bp.route('/analyze_sessions', methods=['POST'])
def analyze_sessions():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    df = fetch_user_sessions(user_id)

    if df is None or len(df) < 5:
        return jsonify({'message': 'Insufficient session data for analysis. At least 5 sessions are required.'}), 200

    scaled_data, original_indices = preprocess_data(df)

    if scaled_data.shape[0] < 2:
        return jsonify({'message': 'Not enough valid data for analysis after preprocessing.'}), 200

    reducer = umap.UMAP(n_neighbors=min(5, scaled_data.shape[0]-1), n_components=2, random_state=42)
    embedding = reducer.fit_transform(scaled_data)

    clustering = DBSCAN(eps=0.5, min_samples=min(3, scaled_data.shape[0])).fit(embedding)
    labels = clustering.labels_

    embedding_for_firestore = [{'x': float(point[0]), 'y': float(point[1])} for point in embedding]

    db = firestore.client()
    analysis_ref = db.collection(f'users/{user_id}/analysis').document('clusters')
    analysis_ref.set({
        'embedding': embedding_for_firestore,
        'labels': labels.tolist(),
        'session_indices': original_indices.tolist()
    })

    return jsonify({'message': 'Analysis complete. Clusters have been identified.'}), 200

@analysis_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    df = fetch_user_sessions(user_id)
    if df is None or len(df) < 5:
        return jsonify({'message': 'Not enough session data to generate recommendations.'}), 200

    df['focus_rating'] = pd.to_numeric(df['focus_rating'], errors='coerce')
    df.dropna(subset=['focus_rating'], inplace=True)

    if df['focus_rating'].max() < 7:
        return jsonify({'message': 'No high-focus sessions recorded yet. Keep tracking to get recommendations.'}), 200

    high_focus = df[df['focus_rating'] >= 7].copy()

    recommended = {}

    numeric_features = ['noise_level', 'light_level', 'motion_level']
    categorical_features = ['headphones', 'ventilation']

    def weighted_median(data, weights):
        data, weights = np.array(data), np.array(weights)
        sorted_indices = np.argsort(data)
        data_sorted = data[sorted_indices]
        weights_sorted = weights[sorted_indices]
        cumsum = np.cumsum(weights_sorted)
        cutoff = weights_sorted.sum() / 2.0
        return data_sorted[cumsum >= cutoff][0]

    for col in numeric_features:
        high_focus[col] = pd.to_numeric(high_focus[col], errors='coerce')
        valid = high_focus.dropna(subset=[col])
        if not valid.empty:
            wm = weighted_median(valid[col], valid['focus_rating'])
            recommended[col] = round(float(wm), 2)

    for col in categorical_features:
        if col in high_focus.columns and not high_focus[col].dropna().empty:
            recommended[col] = high_focus[col].mode().iloc[0]

    correlations = {}
    for col in numeric_features + categorical_features:
        if col in df.columns:
            try:
                col_numeric = pd.to_numeric(df[col], errors='coerce')
                valid_corr = df[['focus_rating', col]].dropna()
                if len(valid_corr) > 2:
                    corr = valid_corr['focus_rating'].corr(pd.to_numeric(valid_corr[col], errors='coerce'))
                    if corr is not None:
                        correlations[col] = corr
            except Exception:
                continue

    sorted_corr = sorted(correlations.items(), key=lambda x: x[1], reverse=True)
    positive_factors = [f"{key} ({value:.2f})" for key, value in sorted_corr if value > 0]

    message = "We've analyzed your past high-focus sessions and found your ideal environment settings."
    if positive_factors:
        message += " The factors that seem to boost your focus the most include: " + ", ".join(positive_factors) + "."
        message += " Try to recreate these conditions to stay in the zone!"

    return jsonify({
        'message': message,
        'recommendations': recommended
    }), 200




@analysis_bp.route('/progress/<user_id>', methods=['GET'])
def get_progress(user_id):
    df = fetch_user_sessions(user_id)
    if df is None:
        return jsonify({'error': 'No session data found for this user.'}), 404

    df['start_time'] = pd.to_datetime(df['start_time'], errors='coerce')
    df['focus_rating'] = pd.to_numeric(df['focus_rating'], errors='coerce')
    df = df.dropna(subset=['start_time', 'focus_rating'])
    df.sort_values('start_time', inplace=True)

    progress_data = df.set_index('start_time')['focus_rating'].resample('W').mean().reset_index()
    progress_data['start_time'] = progress_data['start_time'].dt.strftime('%Y-%m-%d')

    return jsonify(progress_data.to_dict(orient='records')), 200
