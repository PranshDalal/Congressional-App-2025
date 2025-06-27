from flask import Blueprint, request, jsonify
from firebase_admin import firestore # Changed from db
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
    if not sessions:
        return None
    session_list = [doc.to_dict() for doc in sessions]
    return pd.DataFrame(session_list)

def preprocess_data(df):
    features = ['noise_level', 'light_level', 'motion_level', 'focus_rating']
    df_featured = df[features].copy()

    for col in features:
        df_featured[col] = pd.to_numeric(df_featured[col], errors='coerce')
    df_featured.dropna(inplace=True)

    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df_featured)
    return scaled_data, df_featured.index

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

@analysis_bp.route('/clusters/<user_id>', methods=['GET'])
def get_clusters(user_id):
    db = firestore.client()
    analysis_ref = db.collection(f'users/{user_id}/analysis').document('clusters')
    cluster_data = analysis_ref.get()

    if not cluster_data.exists:
        return jsonify({'error': 'No analysis data found for this user.'}), 404

    return jsonify(cluster_data.to_dict()), 200

@analysis_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    df = fetch_user_sessions(user_id)
    if df is None or len(df) < 5:
        return jsonify({'message': 'Not enough session data to generate recommendations.'}), 200

    high_focus_sessions = df[df['focus_rating'] >= 4]

    if high_focus_sessions.empty:
        return jsonify({'message': 'No high-focus sessions recorded yet. Keep tracking to get recommendations.'}), 200

    recommendations = high_focus_sessions[['noise_level', 'light_level', 'motion_level']].mean().to_dict()

    return jsonify({
        'message': 'Based on your high-focus sessions, here are your optimal conditions:',
        'recommendations': recommendations
    }), 200

@analysis_bp.route('/progress/<user_id>', methods=['GET'])
def get_progress(user_id):
    df = fetch_user_sessions(user_id)
    if df is None:
        return jsonify({'error': 'No session data found for this user.'}), 404

    df['start_time'] = pd.to_datetime(df['start_time'])
    df.sort_values('start_time', inplace=True)
    
    progress_data = df.set_index('start_time')['focus_rating'].resample('W').mean().reset_index()
    progress_data['start_time'] = progress_data['start_time'].dt.strftime('%Y-%m-%d')


    return jsonify(progress_data.to_dict(orient='records')), 200