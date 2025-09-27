from flask import Blueprint, request, jsonify
import uuid
from datetime import datetime, timezone

session_bp = Blueprint('session', __name__)

@session_bp.route('/start_session', methods=['POST'])
def start_session():
    from firebase_admin import firestore
    db = firestore.client()  
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    session_id = str(uuid.uuid4())
    # start_time = datetime.utcnow().isoformat()
    start_time = datetime.now(timezone.utc)

    session_data = {
        'start_time': start_time,
        'status': 'active',
        'session_id': session_id
    }

    db.collection('users').document(user_id).collection('sessions').document(session_id).set(session_data)

    return jsonify({'message': 'Session started', 'session_id': session_id}), 200

@session_bp.route('/end_session', methods=['POST'])
def end_session():
    from firebase_admin import firestore 
    db = firestore.client()  
    data = request.get_json()
    user_id = data.get('user_id')
    session_id = data.get('session_id')

    if not user_id or not session_id:
        return jsonify({'error': 'user_id and session_id are required'}), 400

    session_ref = db.collection('users').document(user_id).collection('sessions').document(session_id)
    session_doc = session_ref.get()

    if not session_doc.exists:
        return jsonify({'error': 'Session not found'}), 404

    end_time = datetime.utcnow().isoformat()

    update_data = {
        'end_time': end_time,
        'focus_rating': data.get('focus_rating'),
        'noise_level': data.get('noise_level'),
        'light_level': data.get('light_level'),
        'temperature': data.get('temperature'),
        'humidity': data.get('humidity'),
        'motion_level': data.get('motion_level'),
        'headphones': data.get('headphones'),
        'ventilation': data.get('ventilation'),
        'location': data.get('location'),
        'task_type': data.get('task_type'),
        'status': 'completed'
    }

    session_ref.update(update_data)
    return jsonify({'message': 'Session ended'}), 200

#
# NOTE: Moved getting sessions to client.
#       can still re-add this back for additional saving logic
#
# @session_bp.route('/session/<user_id>', methods=['GET'])
# def get_sessions(user_id):
#     from firebase_admin import firestore
#     db = firestore.client()
#     ref = db.collection('users').document(user_id).collection('sessions')
    
#     status = request.args.get('status')
#     limit = request.args.get('limit', type=int)
#     fields = request.args.get('fields')
#     if fields:
#         field_list = [f.strip() for f in fields.split(',') if f.strip()]
#         ref = ref.select(field_list)
#     if status:
#         ref = ref.where('status', '==', status)
#     if limit:
#         ref = ref.order_by('start_time', direction=firestore.Query.DESCENDING).limit(limit)

#     sessions_docs = ref.stream()
#     sessions = {}
#     for doc in sessions_docs:
#         sessions[doc.id] = doc.to_dict()

#     if not sessions:
#         return jsonify({'message': 'No sessions found'}), 404

#     return jsonify(sessions), 200
