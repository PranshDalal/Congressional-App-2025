from flask import Blueprint, request, jsonify
from firebase_admin import db
import uuid
from datetime import datetime

session_bp = Blueprint('session', __name__)
@session_bp.route('/start_session', methods=['POST'])
def start_session():
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    session_id = str(uuid.uuid4())
    start_time = datetime.utcnow().isoformat()
    session_data = {
        'start_time': start_time,
        'status': 'active',
        'location': data.get('location', ''),
        'session_id': session_id
    }

    db.reference(f'users/{user_id}/sessions/{session_id}').set(session_data)
    return jsonify({'message': 'Session started', 'session_id': session_id}), 200

@session_bp.route('/end_session', methods=['POST'])
def end_session():
    data = request.get_json()
    user_id = data.get('user_id')
    session_id = data.get('session_id')

    if not user_id or not session_id:
        return jsonify({'error': 'user_id and session_id are required'}), 400

    end_time = datetime.utcnow().isoformat()

    session_ref = db.reference(f'users/{user_id}/sessions/{session_id}')
    existing_data = session_ref.get()

    if not existing_data:
        return jsonify({'error': 'Session not found'}), 404

    update_data = {
        'end_time': end_time,
        'focus_rating': data.get('focus_rating'),
        'noise_level': data.get('noise_level'),
        'light_level': data.get('light_level'),
        'motion_level': data.get('motion_level'),
        'headphones': data.get('headphones'),
        'music_info': data.get('music_info'),
        'status': 'completed'
    }

    session_ref.update(update_data)
    return jsonify({'message': 'Session ended'}), 200

@session_bp.route('/session/<user_id>', methods=['GET'])
def get_sessions(user_id):
    sessions_ref = db.reference(f'users/{user_id}/sessions')
    sessions = sessions_ref.get()

    if not sessions:
        return jsonify({'message': 'No sessions found'}), 404

    return jsonify(sessions), 200