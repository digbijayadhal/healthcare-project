import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Load dataset
def load_dataset():
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.json')
    try:
        with open(dataset_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print("Error loading dataset:", e)
        return []

DISEASE_DATASET = load_dataset()


# ✅ Extract symptoms from user text
def extract_symptoms(user_text):
    user_text = user_text.lower()
    detected = set()

    for disease in DISEASE_DATASET:
        for symptom in disease.get("symptoms", []):
            if symptom.lower() in user_text:
                detected.add(symptom.lower())

    return list(detected)


# ✅ Match disease
def find_diseases(user_symptoms):
    results = []

    for disease in DISEASE_DATASET:
        match_count = 0

        for symptom in user_symptoms:
            if symptom in [s.lower() for s in disease["symptoms"]]:
                match_count += 1

        if match_count > 0:
            disease_copy = disease.copy()
            disease_copy["match_score"] = match_count
            results.append(disease_copy)

    # sort by best match
    results.sort(key=lambda x: x["match_score"], reverse=True)

    return results[:3]  # top 3 matches


# ✅ API ROUTE
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    symptoms = extract_symptoms(user_message)
    matches = find_diseases(symptoms)

    if not matches:
        return jsonify({
            "reply": "Sorry, I couldn't find any matching disease.",
            "data": []
        })

    return jsonify({
        "reply": "Here are possible conditions based on your symptoms:",
        "data": matches
    })


if __name__ == "__main__":
    app.run(debug=True)