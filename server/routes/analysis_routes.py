from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import numpy as np
import pandas as pd
from scipy.stats import pearsonr
from datetime import datetime, timezone

analysis_bp = Blueprint('analysis', __name__)


def fetch_user_sessions(user_id, fields=None, status=None, limit=None):
    db = firestore.client()
    ref = db.collection(f'users/{user_id}/sessions')

    if fields:
        ref = ref.select(fields)
    if limit:
        ref = ref.order_by('start_time', direction=firestore.Query.DESCENDING)

    # Filter by status *before* applying the limit, so abandoned or still-active sessions
    # don't use up slots meant for completed ones. Filtering here instead of with a
    # Firestore where() avoids needing a composite (status + start_time) index; the stream
    # is fetched lazily, so we stop reading as soon as we have enough.
    session_list = []
    for doc in ref.stream():
        session = doc.to_dict()
        if status and session.get('status') != status:
            continue
        session_list.append(session)
        if limit and len(session_list) >= limit:
            break

    return pd.DataFrame(session_list) if session_list else None


def weighted_median(data, weights):
    data, weights = np.array(data), np.array(weights)
    sorted_indices = np.argsort(data)
    data_sorted = data[sorted_indices]
    weights_sorted = weights[sorted_indices]
    cumsum = np.cumsum(weights_sorted)
    cutoff = weights_sorted.sum() / 2.0
    return data_sorted[cumsum >= cutoff][0]


# For each feature: what a higher value looks like, and what a lower value looks like
INSIGHT_PHRASES = {
    'noise_level': ("there's more background noise", "the room is quieter"),
    'light_level': ("the light is brighter", "the light is dimmer"),
    'motion_level': ("you move around more", "you stay still"),
    'temperature': ("the room is warmer", "the room is cooler"),
    'humidity': ("the air is more humid", "the air is drier"),
    'headphones': ("you use headphones or music", "you skip headphones or music"),
}

# Ventilation is a label, so each option is correlated as its own yes/no indicator.
# Keys must match the VentilationStatus values in client/app/(app)/session/survey.tsx.
# "Other" is left out because there is no meaningful insight to phrase for it.
VENTILATION_PHRASES = {
    'No Ventilation': ("the room has no ventilation", "the room has some ventilation"),
    'Air Conditioning': ("the air conditioning is on", "the air conditioning is off"),
    'Outside': ("you work outside", "you work indoors"),
    'Open Window': ("a window is open", "the windows are closed"),
    'Fan On': ("a fan is on", "there's no fan"),
}
for _label, _phrases in VENTILATION_PHRASES.items():
    INSIGHT_PHRASES[f'ventilation:{_label}'] = _phrases

# An indicator needs at least this many sessions on each side (with / without the option)
# so a single session can't produce a perfect correlation on its own.
MIN_SESSIONS_PER_GROUP = 2

# Only turn a correlation into an insight if it is statistically significant.
# With at most 20 sessions, even fairly large correlations can appear by chance.
SIGNIFICANCE_LEVEL = 0.05


def holm_adjust(p_values):
    """Holm-Bonferroni adjustment, so testing ~10 factors at once doesn't inflate false positives."""
    ordered = sorted(p_values.items(), key=lambda kv: kv[1])
    m = len(ordered)
    adjusted, running_max = {}, 0.0
    for i, (key, p) in enumerate(ordered):
        running_max = max(running_max, min(1.0, (m - i) * p))
        adjusted[key] = round(running_max, 4)
    return adjusted


def interpret_correlation(feature, value):
    if pd.isna(value) or feature not in INSIGHT_PHRASES or abs(value) <= 0.2:
        return None
    higher, lower = INSIGHT_PHRASES[feature]
    clause = higher if value > 0 else lower
    if abs(value) > 0.5:
        return f"You focus noticeably better when {clause}."
    return f"You tend to focus a bit better when {clause}."


@analysis_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    db = firestore.client()
    df = fetch_user_sessions(
        user_id,
        fields=[
            'focus_rating', 'noise_level', 'light_level', 'motion_level', 'temperature', 'humidity', 'headphones', 'ventilation', 'start_time', 'status', 'light_unit'
        ],
        status='completed',
        limit=20
    )
    if df is None or len(df) < 5:
        return jsonify({'message': 'Not enough session data to generate recommendations.'}), 200

    # Only use light values recorded in lux; older sessions stored a 0-100 camera value.
    if 'light_level' in df.columns:
        is_lux = df['light_unit'] == 'lux' if 'light_unit' in df.columns else False
        df['light_level'] = df['light_level'].where(is_lux)

    df['focus_rating'] = pd.to_numeric(df['focus_rating'], errors='coerce')
    df.dropna(subset=['focus_rating'], inplace=True)

    if df.empty or df['focus_rating'].max() < 7:
        return jsonify({'message': 'No high-focus sessions recorded yet. Keep tracking to get recommendations.'}), 200

    high_focus = df[df['focus_rating'] >= 7].copy()

    recommended = {}
    numeric_features = ['noise_level', 'light_level', 'motion_level', 'temperature', 'humidity']
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
            top = high_focus[col].dropna().mode().iloc[0]
            # headphones is a yes/no answer; ventilation is a label like "Open Window"
            recommended[col] = bool(top) if col == 'headphones' else str(top)

    def add_correlation(key, x, min_per_group=0):
        pair = pd.DataFrame({'focus': df['focus_rating'], 'x': x}).dropna()
        if len(pair) <= 2 or pair['x'].nunique() <= 1:
            return
        if min_per_group and pair['x'].value_counts().min() < min_per_group:
            return
        if pair['focus'].nunique() <= 1:
            return
        r, p = pearsonr(pair['focus'], pair['x'])
        correlations[key] = round(float(r), 3)
        p_values[key] = round(float(p), 4)

    correlations = {}
    p_values = {}
    for col in numeric_features + ['headphones']:
        if col in df.columns:
            add_correlation(col, pd.to_numeric(df[col], errors='coerce').astype(float))

    if 'ventilation' in df.columns:
        answered = df['ventilation'].notna()
        for label in VENTILATION_PHRASES:
            indicator = (df['ventilation'] == label).astype(float).where(answered)
            add_correlation(f'ventilation:{label}', indicator, MIN_SESSIONS_PER_GROUP)
    adjusted_p_values = holm_adjust(p_values)
    insights = [
        interpret_correlation(col, val)
        for col, val in correlations.items()
        if adjusted_p_values[col] < SIGNIFICANCE_LEVEL
    ]
    insights = [msg for msg in insights if msg]

    # Insights are returned separately so the app can show a "no significant patterns" state.
    message = "We've analyzed your past high-focus sessions and found your ideal environment settings."

    pref_ref = db.collection("users").document(user_id).collection("preferences").document("environment")
    recommended['updated_at'] = datetime.now(timezone.utc).isoformat()
    # Drop a stale light preference left over from pre-lux sessions
    if 'light_level' not in recommended:
        recommended['light_level'] = firestore.DELETE_FIELD
    pref_ref.set(recommended, merge=True)

    response_recs = {k: v for k, v in recommended.items() if v is not firestore.DELETE_FIELD}
    return jsonify({
        'message': message,
        'recommendations': response_recs,
        'insights': insights,
        'raw_correlations': correlations,
        'correlation_p_values': p_values,
        'correlation_p_values_adjusted': adjusted_p_values,
        'sessions_analyzed': int(len(df))
    }), 200
