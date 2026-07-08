import tensorflow as tf
import numpy as np
from PIL import Image
import os

DISEASE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust',
    'Apple___healthy', 'Corn___Cercospora_leaf_spot', 'Corn___Common_rust',
    'Corn___Northern_Leaf_Blight', 'Corn___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Tomato___Bacterial_spot',
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___healthy', 'Wheat___Brown_rust', 'Wheat___Yellow_rust', 'Wheat___healthy'
]

ADVISORY = {
    'Apple___Apple_scab': 'Apply fungicide spray. Remove infected leaves.',
    'Apple___Black_rot': 'Prune infected branches. Use copper-based fungicide.',
    'Apple___Cedar_apple_rust': 'Apply myclobutanil fungicide in spring.',
    'Apple___healthy': 'Your crop looks healthy! Keep monitoring.',
    'Corn___Cercospora_leaf_spot': 'Apply strobilurin fungicide. Improve air circulation.',
    'Corn___Common_rust': 'Use resistant varieties. Apply fungicide early.',
    'Corn___Northern_Leaf_Blight': 'Apply fungicide at first sign. Use resistant hybrids.',
    'Corn___healthy': 'Your crop looks healthy! Keep monitoring.',
    'Potato___Early_blight': 'Apply chlorothalonil fungicide. Remove infected leaves.',
    'Potato___Late_blight': 'Apply mancozeb fungicide immediately. Avoid overhead irrigation.',
    'Potato___healthy': 'Your crop looks healthy! Keep monitoring.',
    'Tomato___Bacterial_spot': 'Apply copper bactericide. Avoid working when plants are wet.',
    'Tomato___Early_blight': 'Apply fungicide. Remove lower infected leaves.',
    'Tomato___Late_blight': 'Apply mancozeb immediately. Remove infected plants.',
    'Tomato___Leaf_Mold': 'Improve ventilation. Apply fungicide.',
    'Tomato___healthy': 'Your crop looks healthy! Keep monitoring.',
    'Wheat___Brown_rust': 'Apply triazole fungicide. Use resistant varieties.',
    'Wheat___Yellow_rust': 'Apply fungicide immediately. Monitor regularly.',
    'Wheat___healthy': 'Your crop looks healthy! Keep monitoring.'
}

print("Loading AI model... please wait")

# Model pehle se load karo
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(len(DISEASE_CLASSES), activation='softmax')
])

print("AI model loaded successfully!")

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_disease(image_path):
    try:
        img_array = preprocess_image(image_path)
        predictions = model.predict(img_array, verbose=0)
        predicted_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_index]) * 100
        disease = DISEASE_CLASSES[predicted_index]
        advisory = ADVISORY.get(disease, 'Consult an agricultural expert.')
        return {
            'disease': disease,
            'confidence': round(confidence, 2),
            'advisory': advisory
        }
    except Exception as e:
        return {'error': str(e)}