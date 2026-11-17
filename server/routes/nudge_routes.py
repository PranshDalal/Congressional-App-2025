import os
import requests
from flask import Flask, request, jsonify, Blueprint
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

nudge_bp = Blueprint('nudge', __name__)

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY") 
PERPLEXITY_ENDPOINT = "https://api.perplexity.ai/chat/completions"
MODEL = "sonar"  


# How far a reading can stray from the preferred value before it counts as drift.
# ("abs", n) allows +/- n units; ("rel", f) allows +/- f as a fraction of the preferred value.
DRIFT_TOLERANCES = {
    "light_level": ("rel", 0.4),   # lux spans orders of magnitude, so compare proportionally
    "noise_level": ("abs", 6),     # dB
    "motion_level": ("abs", 0.2),  # g
    "temperature": ("abs", 2),     # °C
    "humidity": ("abs", 10),       # % RH
}


def detect_drifts(current, preferred):
    drifts = []

    #print preferred data
    print("Preferred data:", preferred)
    print("Current data:", current)

    # (current key, preference key, drift message)
    checks = [
        ("light", "light_level", "Lighting is {c} lux, preferred ~{p} lux"),
        ("noise", "noise_level", "Noise is {c} dB, preferred ~{p} dB"),
        ("motion", "motion_level", "Motion is {c}, preferred ~{p}"),
        ("temp", "temperature", "Temperature is {c}°C, preferred ~{p}°C"),
        ("humidity", "humidity", "Humidity is {c}%, preferred ~{p}%"),
    ]
    for current_key, pref_key, message in checks:
        # Skip anything the device couldn't measure this time (sent as null)
        if preferred.get(pref_key) is None or current.get(current_key) is None:
            continue
        try:
            c = float(current[current_key])
            p = float(preferred[pref_key])
        except (TypeError, ValueError):
            continue
        kind, amount = DRIFT_TOLERANCES[pref_key]
        allowed = amount if kind == "abs" else abs(p) * amount
        if abs(c - p) > allowed:
            drifts.append(message.format(c=round(c, 1), p=round(p, 1)))

    session_length_seconds = int(current.get("session_length") or 0)
    session_length_minutes = session_length_seconds // 60
    if session_length_minutes > 30:
        drifts.append(f"Session length is {session_length_minutes} min, exceeding preferred 30 min")

    return drifts


def generate_nudge(drifts, feedback_history):
    prompt = f"""
    The user's environment drifted from preferences in these ways:
    {', '.join(drifts) if drifts else 'No drift detected'}

    Past feedback from user: {feedback_history if feedback_history else 'none'}

    Provide ONE short, ADHD-friendly actionable suggestion (<=20 words).
    Example: "Noise is higher than preferred; try listening to white noise."
    """

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a focus assistant that gives concise ADHD-friendly nudges."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 100,
    }

    response = requests.post(PERPLEXITY_ENDPOINT, headers=headers, json=body)
    response.raise_for_status()
    data = response.json()

    return data["choices"][0]["message"]["content"]


@nudge_bp.route("/get_nudge", methods=["POST"])
def get_nudge():
    db = firestore.client()
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        pref_ref = db.collection("users").document(user_id).collection("preferences").document("environment")
        pref_doc = pref_ref.get()
        if not pref_doc.exists:
            return jsonify({"error": "No preferences set for user"}), 404
        preferred = pref_doc.to_dict()
        drifts = detect_drifts(data, preferred)

        feedbacks = (
            db.collection("users")
            .document(user_id)
            .collection("feedback")
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(5)
            .stream()
        )
        feedback_history = [f.to_dict() for f in feedbacks]

        nudge_text = None
        if drifts:
            nudge_text = generate_nudge(drifts, feedback_history)
        else:
            print("There are no significant drifts.")

        return jsonify({"nudge": nudge_text, "drifts": drifts})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# NOTE: Added to client
# @nudge_bp.route("/feedback", methods=["POST"])
# def feedback():
#     db = firestore.client()
#     data = request.json
#     user_id = data.get("user_id")

#     fb_ref = db.collection("users").document(user_id).collection("feedback").document()
#     fb_ref.set({
#         "nudge_text": data.get("nudge_text"),
#         "response": data.get("response"),
#         "timestamp": datetime.utcnow().isoformat()
#     })

#     return jsonify({"status": "ok"})
