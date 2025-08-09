from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import numpy as np
import pandas as pd

analysis_bp = Blueprint('analysis', __name__)

def fetch_user_sessions(user_id):
    db = firestore.client()
    sessions_ref = db.collection(f'users/{user_id}/sessions')
    sessions = sessions_ref.stream()
    session_list = [doc.to_dict() for doc in sessions]
    return pd.DataFrame(session_list) if session_list else None


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
