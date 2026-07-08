from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from model_loader import predict_disease

app = Flask(__name__)
CORS(app, origins="*")

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'HarvestIQ AI Service is running!'})

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    result = predict_disease(file_path)

    try:
        os.remove(file_path)
    except:
        pass

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True, host='0.0.0.0')