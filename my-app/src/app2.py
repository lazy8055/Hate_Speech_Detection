from flask import Flask, request, render_template, jsonify
import praw
import tensorflow as tf
from transformers import BertTokenizer, TFBertModel
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Flask app initialization
app = Flask(__name__)

# Initialize Reddit API
reddit = praw.Reddit(
    client_id='p1UJ6eY_nX5F6aF9KCo5TQ',
    client_secret='Jlx3BRJi4JvWrIyL-RKlJUy4wEu1pw',
    user_agent='your_user_agent'
)

# Load the BERT model and tokenizer
MAX_LENGTH = 128
bert_model = TFBertModel.from_pretrained('bert-base-uncased')

# Define a custom BERT model class to load weights correctly
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

# Load the custom BERT model with weights
model = CustomBERTModel(bert_model, num_classes=2)
dummy_inputs = {
    'input_ids': tf.constant([[0] * MAX_LENGTH]),
    'attention_mask': tf.constant([[0] * MAX_LENGTH])
}
model(dummy_inputs)  # Initialize the model
model.load_weights('bert_model_weights.h5')

# Load the BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

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
    predictions = model({'input_ids': input_ids, 'attention_mask': attention_mask})
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

@app.route('/')
def index():
    return render_template('index.html')

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

if __name__ == '__main__':
    app.run(debug=True)
