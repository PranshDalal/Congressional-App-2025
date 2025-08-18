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


def weighted_median(data, weights):
    data, weights = np.array(data), np.array(weights)
    sorted_indices = np.argsort(data)
    data_sorted = data[sorted_indices]
    weights_sorted = weights[sorted_indices]
    cumsum = np.cumsum(weights_sorted)
    cutoff = weights_sorted.sum() / 2.0
    return data_sorted[cumsum >= cutoff][0]


def interpret_correlation(feature, value):
    if pd.isna(value):
        return None
    if value > 0.5:
        return f"Higher {feature} strongly supports your focus."
    elif 0.2 < value <= 0.5:
        return f"{feature.capitalize()} has a mild positive effect on your focus."
    elif -0.5 <= value < -0.2:
        return f"Lower {feature} may help you focus better."
    elif value < -0.5:
        return f"{feature.capitalize()} seems to strongly hurt your focus."
    return None


@analysis_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    df = fetch_user_sessions(user_id)
    if df is None or len(df) < 5:
        return jsonify({'message': 'Not enough session data to generate recommendations.'}), 200

    df['focus_rating'] = pd.to_numeric(df['focus_rating'], errors='coerce')
    df.dropna(subset=['focus_rating'], inplace=True)

    if df.empty or df['focus_rating'].max() < 7:
        return jsonify({'message': 'No high-focus sessions recorded yet. Keep tracking to get recommendations.'}), 200

    high_focus = df[df['focus_rating'] >= 7].copy()

    recommended = {}
    numeric_features = ['noise_level', 'light_level', 'motion_level']
    categorical_features = ['headphones', 'ventilation']

    for col in numeric_features:
        if col in high_focus.columns:
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
                valid_corr = df[['focus_rating', col_numeric]].dropna()
                if len(valid_corr) > 2:
                    corr = valid_corr['focus_rating'].corr(valid_corr[col_numeric])
                    correlations[col] = corr
            except Exception:
                continue
    insights = [interpret_correlation(col, val) for col, val in correlations.items()]
    insights = [msg for msg in insights if msg]

    message = "We've analyzed your past high-focus sessions and found your ideal environment settings."
    if insights:
        message += " Here’s what we learned: " + " ".join(insights)

    return jsonify({
        'message': message,
        'recommendations': recommended,
        'insights': insights,
        'raw_correlations': correlations
    }), 200
