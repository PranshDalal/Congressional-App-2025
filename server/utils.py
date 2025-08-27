# from datetime import datetime, timezone

# from flask import Flask
# from flask_cors import CORS
# import firebase_admin
# from firebase_admin import credentials
# from firebase_admin import firestore

# cred = credentials.Certificate('service_acc.json')
# firebase_admin.initialize_app(cred)

# db = firestore.client()

# def change_all_times_to_timestamps():
#     """
#     Convert start_time and end_time from ISO strings to Firestore timestamps
#     for all user sessions in the database.
#     """
#     try:
#         print("Starting time conversion process...")
        
#         total_users = 0
#         total_sessions_updated = 0
#         errors = []
        
#         total_users += 1
#         NOTE: PUT USERID OF THE PERSON THAT NEEDS TO BE UPDATED
#         user_id = ""
#         # print(f"Processing user: {user_id}")
        
#         # Get all sessions for this user
#         sessions_ref = db.collection('users').document(user_id).collection('sessions')
#         sessions = sessions_ref.stream()
        
#         user_sessions_updated = 0
        
#         for session_doc in sessions:
#             session_id = session_doc.id
#             session_data = session_doc.to_dict()
            
#             # print(user_id, session_id)
            
#             try:
#                 updates = {}
                
#                 # Convert start_time if it exists and is a string
#                 if 'start_time' in session_data and isinstance(session_data['start_time'], str):
#                     try:
#                         # Parse ISO string to datetime
#                         start_dt = datetime.fromisoformat(session_data['start_time'].replace('Z', '+00:00'))
#                         updates['start_time'] = start_dt
#                         print(f"  Converting start_time: {session_data['start_time']} -> {start_dt}")
#                     except ValueError as e:
#                         print(f"  Error parsing start_time for session {session_id}: {e}")
#                         errors.append(f"User {user_id}, Session {session_id}: start_time parse error - {e}")
                
#                 # Convert end_time if it exists and is a string
#                 if 'end_time' in session_data and isinstance(session_data['end_time'], str):
#                     try:
#                         # Parse ISO string to datetime
#                         end_dt = datetime.fromisoformat(session_data['end_time'].replace('Z', '+00:00'))
#                         updates['end_time'] = end_dt
#                         print(f"  Converting end_time: {session_data['end_time']} -> {end_dt}")
#                     except ValueError as e:
#                         print(f"  Error parsing end_time for session {session_id}: {e}")
#                         errors.append(f"User {user_id}, Session {session_id}: end_time parse error - {e}")
                
#                 # Update the document if there are changes
#                 if updates:
#                     session_doc.reference.update(updates)
#                     user_sessions_updated += 1
#                     print(f"  Updated session {session_id}")
#                 else:
#                     print(f"  No time fields to update for session {session_id}")
                    
#             except Exception as e:
#                 error_msg = f"User {user_id}, Session {session_id}: Update error - {e}"
#                 print(f"  Error: {error_msg}")
#                 errors.append(error_msg)
        
#         total_sessions_updated += user_sessions_updated
#         print(f"Completed user {user_id}: {user_sessions_updated} sessions updated")
        
#         print(f"\n=== Conversion Complete ===")
#         print(f"Total users processed: {total_users}")
#         print(f"Total sessions updated: {total_sessions_updated}")
        
#         if errors:
#             print(f"\nErrors encountered ({len(errors)}):")
#             for error in errors:
#                 print(f"  - {error}")
#         else:
#             print("\nNo errors encountered!")
            
#         return {
#             'success': True,
#             'users_processed': total_users,
#             'sessions_updated': total_sessions_updated,
#             'errors': errors
#         }
        
#     except Exception as e:
#         print(f"Fatal error during conversion: {e}")
#         return {
#             'success': False,
#             'error': str(e)
#         }

# def convert_iso_to_timestamp(iso_string):
#     """
#     Helper function to convert ISO string to datetime object
#     Handles various ISO formats including with/without timezone
#     """
#     if not isinstance(iso_string, str):
#         return iso_string
    
#     try:
#         # Handle ISO strings with 'Z' (UTC)
#         if iso_string.endswith('Z'):
#             iso_string = iso_string.replace('Z', '+00:00')
        
#         # Parse the ISO string
#         dt = datetime.fromisoformat(iso_string)
        
#         # If no timezone info, assume UTC (this handles your case)
#         if dt.tzinfo is None:
#             dt = dt.replace(tzinfo=timezone.utc)
            
#         return dt
#     except ValueError:
#         raise ValueError(f"Unable to parse ISO string: {iso_string}")

# # Test your specific timestamp:
# # test_timestamp = "2025-08-09T01:04:22.085010"
# # converted = convert_iso_to_timestamp(test_timestamp)
# # print(f"Original: {test_timestamp}")
# # print(f"Converted: {converted}")
# # Output: 2025-08-09 01:04:22.085010+00:00

# # Alternative batch processing version for large datasets
# def change_all_times_to_timestamps_batch():
#     """
#     Batch version for very large datasets
#     Processes in smaller chunks to avoid memory issues
#     """
#     batch_size = 100
    
#     try:
#         print("Starting batch time conversion process...")
        
#         users_ref = db.collection('users')
#         users = users_ref.stream()
        
#         for user_doc in users:
#             user_id = user_doc.id
#             print(f"Processing user: {user_id}")
            
#             sessions_ref = db.collection('users').document(user_id).collection('sessions')
            
#             # Process sessions in batches
#             batch = db.batch()
#             batch_count = 0
            
#             for session_doc in sessions_ref.stream():
#                 session_data = session_doc.to_dict()
#                 updates = {}
                
#                 # Convert start_time
#                 if 'start_time' in session_data and isinstance(session_data['start_time'], str):
#                     updates['start_time'] = convert_iso_to_timestamp(session_data['start_time'])
                
#                 # Convert end_time
#                 # if 'end_time' in session_data and isinstance(session_data['end_time'], str):
#                 #     updates['end_time'] = convert_iso_to_timestamp(session_data['end_time'])
                
#                 if updates:
#                     batch.update(session_doc.reference, updates)
#                     batch_count += 1
                
#                 # Commit batch when it reaches batch_size
#                 if batch_count >= batch_size:
#                     batch.commit()
#                     print(f"  Committed batch of {batch_count} updates")
#                     batch = db.batch()
#                     batch_count = 0
            
#             # Commit remaining updates
#             if batch_count > 0:
#                 batch.commit()
#                 print(f"  Committed final batch of {batch_count} updates")
            
#             print(f"Completed user {user_id}")
        
#         print("Batch conversion complete!")
        
#     except Exception as e:
#         print(f"Error in batch conversion: {e}")

# result = change_all_times_to_timestamps()
    
# if result['success']:
#     print("Time conversion completed successfully!")
# else:
#     print(f"Time conversion failed: {result['error']}")