from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from routes.session_routes import session_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    cred = credentials.Certificate('service_acc.json')
    firebase_admin.initialize_app(cred)

    db_client = firestore.client()

    app.register_blueprint(session_bp, url_prefix='/api')

    @app.route('/api/hello', methods=['GET'])
    def hello():
        return {'message': 'Nathan is cool!'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)