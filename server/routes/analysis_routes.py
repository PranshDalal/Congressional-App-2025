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

    for col in ['temperature', 'humidity']:
        if col in df.columns and df[col].isnull().all():
            print(f"Dropping column {col} from features due to all missing values.")
            numeric.remove(col)

    for col in numeric:
        df[col] = pd.to_numeric(df[col], errors='coerce')


    print(f"Initial DataFrame shape: {df.shape}")
    print(f"Initial columns: {list(df.columns)}")
    print("Missing values before encoding:")
    print(df.isnull().sum())

    df = pd.get_dummies(df, columns=categorical, drop_first=True)

    features = [col for col in df.columns if col not in ['focus_rating', 'target', 'start_time', 'status']]
    features = [col for col in features if not df[col].isnull().all()]
    print(f"Columns after encoding: {list(df.columns)}")
    print("Missing values after encoding:")
    print(df[features + ['target']].isnull().sum())
    before_drop = len(df)
    df = df.dropna(subset=features + ['target'])
    after_drop = len(df)
    print(f"Rows before dropna: {before_drop}, after dropna: {after_drop}")
    print(f"Valid rows after preprocessing: {len(df)}")

    if len(df) < 10:
        return None, "Not enough valid data", features

    X = df[features]
    y = df['target']

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression())
    ])

    model.fit(X, y)
    return model, None, features


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
    features = model.named_steps['scaler'].get_feature_names_out() if hasattr(model.named_steps['scaler'], 'get_feature_names_out') else None
    if features is None:
        features = model.feature_names_in_ if hasattr(model, 'feature_names_in_') else None
    if features is None:
        raise ValueError("Could not determine feature names from model.")
    coef = model.named_steps['clf'].coef_[0]

    best_env = {}
    for i, feat in enumerate(features):
        if any(feat.startswith(n) for n in ['noise_level', 'light_level', 'motion_level', 'temperature', 'humidity']):
            col = pd.to_numeric(df[feat], errors='coerce').dropna()
            if len(col) == 0:
                continue
            if coef[i] > 0:
                best_env[feat] = float(col.quantile(0.8))
            else:
                best_env[feat] = float(col.quantile(0.2))
        else:
            best_env[feat] = 1 if coef[i] > 0 else 0

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


    model, err, features = train_focus_model(df)
    if model is None:
        return jsonify({'message': err}), 200

    insights = feature_importance(model, features)
    best_env = compute_best_environment(df, model)
    print(f"Insights: {insights}")
    print(f"Best environment: {best_env}")

    recommendations = {}
    for key in ['noise_level', 'light_level', 'motion_level']:
        if key in best_env:
            recommendations[key] = best_env[key]

    if 'headphones_True' in best_env:
        recommendations['headphones'] = bool(best_env['headphones_True'])

    ventilation_types = [
        'ventilation_Air conditioning (AC)',
        'ventilation_Closed room (no ventilation)',
        'ventilation_No Ventilation'
    ]
    for v_key in ventilation_types:
        if v_key in best_env and best_env[v_key] == 1:
            recommendations['ventilation'] = v_key.replace('ventilation_', '')
            break
    else:
        recommendations['ventilation'] = 'Air conditioning (AC)'

    if 'success_probability' in best_env:
        recommendations['success_probability'] = best_env['success_probability']

    pref_ref = db.collection("users").document(user_id).collection("preferences").document("environment")
    best_env['updated_at'] = datetime.utcnow().isoformat()
    pref_ref.set(best_env, merge=True)

    return jsonify({
        "message": "Analysis complete",
        "recommendations": recommendations,
        "insights": insights
    }), 200
