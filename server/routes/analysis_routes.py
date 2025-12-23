from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

analysis_bp = Blueprint('analysis', __name__)


def fetch_user_sessions(user_id, fields=None, status=None, limit=None):
    db = firestore.client()
    ref = db.collection(f'users/{user_id}/sessions')

    if fields:
        ref = ref.select(fields)
    if limit:
        ref = ref.order_by('start_time', direction=firestore.Query.DESCENDING).limit(limit)

    sessions = ref.stream()
    session_list = [doc.to_dict() for doc in sessions]

    if status:
        session_list = [s for s in session_list if s.get('status') == status]

    return pd.DataFrame(session_list) if session_list else None


def train_focus_model(df):
    numeric = ['noise_level', 'light_level', 'motion_level', 'temperature', 'humidity']
    categorical = ['headphones', 'ventilation']

    df = df.copy()
    df['focus_rating'] = pd.to_numeric(df['focus_rating'], errors='coerce')
    df['target'] = (df['focus_rating'] >= 7).astype(int)

    for col in numeric:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    for col in categorical:
        if col in df.columns:
            df[col] = df[col].astype(float)

    features = numeric + categorical
    df = df.dropna(subset=features + ['target'])

    if len(df) < 10:
        return None, "Not enough valid data"

    X = df[features]
    y = df['target']

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression())
    ])

    model.fit(X, y)
    return model, None


def feature_importance(model, feature_names):
    coef = model.named_steps['clf'].coef_[0]
    importance = sorted(list(zip(feature_names, coef)), key=lambda x: abs(x[1]), reverse=True)

    explanations = []
    for feat, weight in importance:
        if weight > 0:
            explanations.append(f"Higher {feat.replace('_',' ')} increases your probability of good focus.")
        elif weight < 0:
            explanations.append(f"Higher {feat.replace('_',' ')} reduces your probability of good focus.")

    return explanations[:4]


def compute_best_environment(df, model):
    numeric = ['noise_level', 'light_level', 'motion_level', 'temperature', 'humidity']
    categorical = ['headphones', 'ventilation']
    features = numeric + categorical

    coef = model.named_steps['clf'].coef_[0]

    best_env = {}

    for i, feat in enumerate(features):
        if feat in numeric:
            col = pd.to_numeric(df[feat], errors='coerce').dropna()

            if len(col) == 0:
                continue

            if coef[i] > 0:
                best_env[feat] = float(col.quantile(0.8))   
            else:
                best_env[feat] = float(col.quantile(0.2))   

        else:
            if coef[i] > 0:
                best_env[feat] = True
            else:
                best_env[feat] = False

    x = np.array([[best_env.get(f, 0) for f in features]])
    prob = model.predict_proba(x)[0][1]

    best_env["success_probability"] = round(float(prob), 3)
    return best_env


@analysis_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    db = firestore.client()

    df = fetch_user_sessions(
        user_id,
        fields=[
            'focus_rating', 'noise_level', 'light_level',
            'motion_level', 'temperature', 'humidity',
            'headphones', 'ventilation', 'start_time', 'status'
        ],
        status='completed',
        limit=50
    )

    if df is None or len(df) < 8:
        return jsonify({'message': 'Not enough session data to generate recommendations'}), 200

    model, err = train_focus_model(df)
    if model is None:
        return jsonify({'message': err}), 200

    features = ['noise_level', 'light_level', 'motion_level', 'temperature', 'humidity', 'headphones', 'ventilation']
    insights = feature_importance(model, features)

    best_env = compute_best_environment(df, model)

    pref_ref = db.collection("users").document(user_id).collection("preferences").document("environment")
    best_env['updated_at'] = datetime.utcnow().isoformat()
    pref_ref.set(best_env, merge=True)

    return jsonify({
        "message": "Analysis complete",
        "predicted_best_environment": best_env,
        "insights": insights
    }), 200
