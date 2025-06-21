# 🛑 Hate Speech Detection Web App

An AI-powered web application for detecting hate speech in social media posts using text and audio input. Supports multi-model classification (Logistic Regression, Random Forest, Decision Tree, BERT) and includes explainable AI with LIME. Also integrates with Reddit API for large-scale community analysis.

---

## 🚀 Features

- 🔤 **Multi-input Support**: Classifies text or audio (converted to text) to detect hate speech.
- 🧠 **ML Model Pipeline**:
  - Logistic Regression
  - Decision Tree
  - Random Forest
  - BERT (achieved highest accuracy: _97.8%_)
- 🧾 **Explainable AI**:
  - Uses **LIME** to highlight influential words driving classification decisions.
- 🛠️ **Reddit Integration**:
  - Analyze **all comments from a Reddit post** to flag hateful users and comments.
  - **Send DMs** to users identified as posting hate speech.
  - Analyze all past comments of a **Reddit username** and generate:
    - Comment-wise classifications.
    - **Hate Speech % vs Total Comments** graph.

---

## 🧰 Tech Stack

- **Frontend**: React
- **Backend**: Flask
- **Machine Learning**: TensorFlow, scikit-learn, BERT, LIME
- **Models Used**: Logistic Regression, Decision Tree, Random Forest, BERT
- **Reddit Integration**: PRAW (Python Reddit API Wrapper)

---

## 📊 Model Performance

<details>
<summary>🔎 Click to view Confusion Matrix Comparison</summary>
<br>

<table>
  <tr>
    <th>Logistic Regression</th>
    <th>Decision Tree</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/792e6766-039f-49ce-a91b-fe92dea59630" width="300"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/eeb3e525-d369-41d9-ae1b-bc612118e759" width="300"/>
    </td>
  </tr>
  <tr>
    <th>Random Forest</th>
    <th>BERT Model</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/373dcc7f-90ef-4dcb-80d4-58622fcfaef1" width="300"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/4f3d34ae-6ebe-4ccb-b592-d1f16464b969" width="300"/>
    </td>
  </tr>
</table>

</details>

### Metrics(Accuracy, Precision, Recall, F1 score and Specificity):
Logistic Regression, Decision Tree, Random Forest:
![traditional_models_metrics](https://github.com/user-attachments/assets/63e3e1d1-8478-480e-8422-dccee74a22aa)

BERT:
![bert_model_metrics](https://github.com/user-attachments/assets/bc01ffb7-a010-4a2d-8a7a-707911faf3b7)



---

## 🏗️ Architecture

### Overall Architecture
![Untitled Diagram drawio(3)](https://github.com/user-attachments/assets/f8f482d8-533f-4ad5-96cb-573c724d2c8f)

### Model Prediction and Explainable AI(LIME)
![Untitled Diagram drawio(5)](https://github.com/user-attachments/assets/1b685ed8-d060-4956-a548-3819c511bace)



---

## 🖼️ Screenshots

<details>
<summary>🔎 Click to view sample outputs</summary>

### Hate Speech Detection & LIME Analysis
![hate_detect_page](https://github.com/user-attachments/assets/84ffa827-8bc8-4e1f-ab47-51e2965d362b)

### Reddit API Intergration
![Reddit_comment_page](https://github.com/user-attachments/assets/6a7347bf-b5de-4675-9a0f-50e1881889f5)

![Reddit _user_page](https://github.com/user-attachments/assets/e63b9a48-e38b-47ad-8fcd-55bdfcd5e868)



</details>

---

