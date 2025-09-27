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


def detect_drifts(current, preferred, tolerance=0.2):
    drifts = []

    if "light" in preferred and preferred["light"] is not None:
        try:
            current_light = float(current.get("light", 0))
            preferred_light = float(preferred.get("light", 0))
            if not (preferred_light * (1 - tolerance) <= current_light <= preferred_light * (1 + tolerance)):
                drifts.append(f"Lighting is {current_light}, preferred ~{preferred_light}")
        except ValueError:
            if current.get("light") != preferred.get("light"):
                drifts.append(f"Lighting is {current.get('light')} but preferred is {preferred.get('light')}")

    if "noise" in preferred and preferred["noise"] is not None:
        try:
            current_noise = float(current.get("noise", 0))
            preferred_noise = float(preferred.get("noise", 0))
            if not (preferred_noise * (1 - tolerance) <= current_noise <= preferred_noise * (1 + tolerance)):
                drifts.append(f"Noise is {current_noise} dB, preferred ~{preferred_noise} dB")
        except ValueError:
            if current.get("noise") != preferred.get("noise"):
                drifts.append(f"Noise is {current.get('noise')} but preferred is {preferred.get('noise')}")

    if "motion" in preferred and preferred["motion"] is not None:
        try:
            current_motion = float(current.get("motion", 0))
            preferred_motion = float(preferred.get("motion", 0))
            if not (preferred_motion * (1 - tolerance) <= current_motion <= preferred_motion * (1 + tolerance)):
                drifts.append(f"Motion is {current_motion}, preferred ~{preferred_motion}")
        except ValueError:
            drifts.append("Motion value invalid")

    if "temperature" in preferred and preferred["temperature"] is not None:
        try:
            current_temp = float(current.get("temperature", 0))
            preferred_temp = float(preferred.get("temperature", 0))
            if not (preferred_temp * (1 - tolerance) <= current_temp <= preferred_temp * (1 + tolerance)):
                drifts.append(f"Temperature is {current_temp}°C, preferred ~{preferred_temp}°C")
        except ValueError:
            if current.get("temperature") != preferred.get("temperature"):
                drifts.append(f"Temperature is {current.get('temperature')} but preferred is {preferred.get('temperature')}")

    if "humidity" in preferred and preferred["humidity"] is not None:
        try:
            current_humidity = float(current.get("humidity", 0))
            preferred_humidity = float(preferred.get("humidity", 0))
            if not (preferred_humidity * (1 - tolerance) <= current_humidity <= preferred_humidity * (1 + tolerance)):
                drifts.append(f"Humidity is {current_humidity}%, preferred ~{preferred_humidity}%")
        except ValueError:
            if current.get("humidity") != preferred.get("humidity"):
                drifts.append(f"Humidity is {current.get('humidity')} but preferred is {preferred.get('humidity')}")

    session_length_seconds = int(current.get("session_length", 0))
    session_length_minutes = session_length_seconds // 60
    if session_length_minutes > 1:
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
    data = request.json
    user_id = data.get("user_id")

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
