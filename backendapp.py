from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import tensorflow as tf
from transformers import TFBertModel, BertTokenizer
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import praw
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend for matplotlib

# Flask app initialization
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize BERT model parameters
MAX_LENGTH = 128
class_names = ['Normal', 'Hate Speech']

# Define a custom BERT model class
class CustomBERTModel(tf.keras.Model):
    def __init__(self, bert_model, num_classes):
        super(CustomBERTModel, self).__init__()
        self.bert = bert_model
        self.output_layer = tf.keras.layers.Dense(num_classes, activation='softmax')

    def call(self, inputs):
        input_ids = inputs['input_ids']
        attention_mask = inputs['attention_mask']
        outputs = self.bert(input_ids, attention_mask=attention_mask, return_dict=True)
        pooled_output = outputs.pooler_output
        return self.output_layer(pooled_output)

# Initialize and load BERT model and tokenizer
bert_model = TFBertModel.from_pretrained('bert-base-uncased')
bert_custom_model = CustomBERTModel(bert_model, num_classes=2)
dummy_inputs = {
    'input_ids': tf.constant([[0] * MAX_LENGTH]),
    'attention_mask': tf.constant([[0] * MAX_LENGTH])
}
bert_custom_model(dummy_inputs)  # Initialize the model
bert_custom_model.load_weights('bert_model_weights.h5')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Load traditional models
lr_model = joblib.load('lr_model.pkl')
dt_model = joblib.load('dt_model.pkl')
rf_model = joblib.load('rf_model.pkl')
vectorizer = joblib.load('vectorizer.pkl')

# Load label encoder
label_encoder = joblib.load('label_encoder.pkl')

# Define the models dictionary
models = {
    'Logistic Regression': lr_model,
    'Decision Tree': dt_model,
    'Random Forest': rf_model,
    'BERT Model': bert_custom_model
}

# Initialize Reddit API
reddit = praw.Reddit(
    client_id='p1UJ6eY_nX5F6aF9KCo5TQ',
    client_secret='Jlx3BRJi4JvWrIyL-RKlJUy4wEu1pw',
    user_agent='your_user_agent',
    username='Greedy-Direction-207',
    password='hari2005$',
    check_for_async=False  
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        model_name = request.form['model']
        text = request.form['text']

        if not text:
            return jsonify({"error": "No text provided"}), 400

        def predict_proba_wrapper(texts):
            if model_name == "BERT Model":
                encoding = tokenizer(
                    texts,
                    max_length=MAX_LENGTH,
                    padding='max_length',
                    truncation=True,
                    return_tensors='tf'
                )
                input_ids = tf.cast(encoding['input_ids'], tf.int32)
                attention_mask = tf.cast(encoding['attention_mask'], tf.int32)
                predictions = models[model_name]({'input_ids': input_ids, 'attention_mask': attention_mask})
                return predictions.numpy()
            else:
                texts_vectorized = vectorizer.transform(texts)
                return models[model_name].predict_proba(texts_vectorized)

        if model_name == "BERT Model":
            encoding = tokenizer(
                [text],
                max_length=MAX_LENGTH,
                padding='max_length',
                truncation=True,
                return_tensors='tf'
            )
            input_ids = tf.cast(encoding['input_ids'], tf.int32)
            attention_mask = tf.cast(encoding['attention_mask'], tf.int32)
            predictions = models[model_name]({'input_ids': input_ids, 'attention_mask': attention_mask})
            predicted_class = tf.argmax(predictions, axis=1).numpy()[0]
            predicted_label = 'Normal' if predicted_class == 0 else 'Hate Speech'
            
            # LIME explanation
            from lime.lime_text import LimeTextExplainer
            explainer = LimeTextExplainer(class_names=class_names)
            explanation = explainer.explain_instance(text, lambda x: predict_proba_wrapper(x), num_features=10, num_samples=100)
            
            # Plot the explanation
            fig, ax = plt.subplots()
            exp_values = dict(explanation.as_list())
            colors = ['red' if val > 0 else 'green' for val in exp_values.values()]
            ax.barh(list(exp_values.keys()), list(exp_values.values()), color=colors)
            ax.set_title(f'Local explanation for class {predicted_label}')
            
            # Convert plot to base64 string
            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
            buf.close()

            response = {
                "predicted_label": predicted_label,
                "lime_plot": img_str
            }
            return jsonify(response)

        else:
            # For other models
            input_vectorized = vectorizer.transform([text])
            model = models[model_name]
            prediction = model.predict(input_vectorized)
            predicted_label = class_names[prediction[0]]
            
            # LIME explanation
            from lime.lime_text import LimeTextExplainer
            explainer = LimeTextExplainer(class_names=class_names)
            explanation = explainer.explain_instance(text, lambda x: predict_proba_wrapper(x), num_features=10)
            
            # Plot the explanation
            fig, ax = plt.subplots()
            exp_values = dict(explanation.as_list())
            colors = ['red' if val > 0 else 'green' for val in exp_values.values()]
            ax.barh(list(exp_values.keys()), list(exp_values.values()), color=colors)
            ax.set_title(f'Local explanation for class {predicted_label}')
            
            # Convert plot to base64 string
            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
            buf.close()

            response = {
                "predicted_label": predicted_label,
                "lime_plot": img_str
            }
            return jsonify(response)

    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to classify comments
def classify_comments(comments):
    encodings = tokenizer(
        comments.tolist(),
        max_length=MAX_LENGTH,
        padding='max_length',
        truncation=True,
        return_tensors='tf'
    )
    input_ids = tf.cast(encodings['input_ids'], tf.int32)
    attention_mask = tf.cast(encodings['attention_mask'], tf.int32)
    predictions = bert_custom_model({'input_ids': input_ids, 'attention_mask': attention_mask})
    predicted_classes = tf.argmax(predictions, axis=1).numpy()
    return ["Hate Speech" if cls == 1 else "Normal" for cls in predicted_classes]

# Function to plot a pie chart
def plot_pie_chart(hate_speech_count, normal_count):
    fig, ax = plt.subplots()
    ax.pie([hate_speech_count, normal_count], labels=["Hate Speech", "Normal"], autopct='%1.1f%%', colors=['#ff9999', '#66b3ff'])
    ax.axis("equal")
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)
    return img_base64

@app.route('/fetch_and_classify', methods=['POST'])
def fetch_and_classify():
    post_url = request.form.get('post_url')
    try:
        post_id = post_url.split('/')[-3]
        post = reddit.submission(id=post_id)
        post.comments.replace_more(limit=None)
        comments = []
        for comment in post.comments.list():
            if isinstance(comment, praw.models.Comment):
                author = comment.author.name if comment.author else "Unknown"
                comments.append((author, comment.body))

        if not comments:
            return jsonify({"error": "No comments found."})

        df = pd.DataFrame(comments, columns=["Username", "Comment"])
        df["Comment Type"] = classify_comments(df["Comment"])
        hate_speech_df = df[df["Comment Type"] == "Hate Speech"]
        hate_speech_count = len(hate_speech_df)
        normal_count = len(df) - hate_speech_count
        pie_chart_img = plot_pie_chart(hate_speech_count, normal_count)
        comments_html = df.to_html(classes='table', index=False)
        hate_speech_html = hate_speech_df.to_html(classes='table', index=False)
        return jsonify({"comments_html": comments_html, "hate_speech_html": hate_speech_html, "pie_chart_img": pie_chart_img})

    except Exception as e:
        return jsonify({"error": str(e)})
@app.route('/fetch_user_comments', methods=['POST'])
def fetch_user_comments():
    username = request.form.get('username')
    try:
        user = reddit.redditor(username)
        comments = []
        
        # Fetch the most recent 100 user comments
        for comment in user.comments.new(limit=100):
            comments.append((comment.subreddit.display_name, comment.body))

        if not comments:
            return jsonify({"error": "No comments found for this user."})

        df = pd.DataFrame(comments, columns=["Subreddit", "Comment"])
        df["Comment Type"] = classify_comments(df["Comment"])
        hate_speech_count = len(df[df["Comment Type"] == "Hate Speech"])
        normal_count = len(df) - hate_speech_count
        
        pie_chart_img = plot_pie_chart(hate_speech_count, normal_count)
        comments_html = df.to_html(classes='table', index=False)

        return jsonify({"comments_html": comments_html, "pie_chart_img": pie_chart_img})

    except Exception as e:
        return jsonify({"error": str(e)})
@app.route('/send_warning_message', methods=['POST'])
def send_warning_message():
    username = request.form.get('username')
    message = request.form.get('message')
    
    try:
        reddit.redditor(username).message('good', message)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)})
@app.route('/notify_all_hatespeech_users', methods=['POST'])
def notify_all_hatespeech_users():
    post_url = request.form.get('post_url')
    try:
        post_id = post_url.split('/')[-3]
        post = reddit.submission(id=post_id)
        post.comments.replace_more(limit=None)
        comments = []
        
        # Fetch all comments and hate speech users
        for comment in post.comments.list():
            if isinstance(comment, praw.models.Comment) and comment.author:
                comments.append((comment.author.name, comment.body))
        
        if not comments:
            return jsonify({"error": "No comments found."})

        df = pd.DataFrame(comments, columns=["Username", "Comment"])
        df["Comment Type"] = classify_comments(df["Comment"])
        hate_speech_df = df[df["Comment Type"] == "Hate Speech"]

        # Send notification to all hate speech users
        for _, row in hate_speech_df.iterrows():
            username = row["Username"]
            comment = row["Comment"]
            message = f'Test message for project:You commented this comment "{comment}" under this post "{post_url}". Please be mindful of your comment.'
            reddit.redditor(username).message('Reminder', message)

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)})
if __name__ == '__main__':
    app.run(debug=True)
