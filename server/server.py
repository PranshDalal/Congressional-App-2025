from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Nathan is cool!")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')