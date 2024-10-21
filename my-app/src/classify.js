import React, { useState } from 'react';
import './classify.css';

const Classify = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('Logistic Regression');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading

  const handleSubmit = (event) => {
    event.preventDefault();

    // Clear previous result and error
    setResult(null);
    setError(null);

    setLoading(true); // Show loading animation

    const formData = new FormData();
    formData.append('text', text);
    formData.append('model', model);

    fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
        setError(null);
      }
      setLoading(false); // Hide loading animation
    })
    .catch(err => {
      setError('An error occurred while processing the request.');
      setResult(null);
      setLoading(false); // Hide loading animation
    });
  };

  return (
    <div className="classify-container">
      <h1>Hate Speech Detection</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="text">Enter Text:</label>
        <textarea
          id="text"
          name="text"
          rows="4"
          cols="50"
          placeholder="Enter the text you want to classify..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        <label htmlFor="model">Choose Model:</label>
        <select
          id="model"
          name="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="Logistic Regression">Logistic Regression</option>
          <option value="Decision Tree">Decision Tree</option>
          <option value="Random Forest">Random Forest</option>
          <option value="BERT Model">BERT Model</option>
        </select>

        <button type="submit">Classify</button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <p><strong>Predicted Label:</strong> {result.predicted_label}</p>
          {result.lime_plot && <img src={`data:image/png;base64,${result.lime_plot}`} alt="LIME Explanation" />}
        </div>
      )}
      
      {loading && (
        <div className="loading-container">
          <img src="./a.gif" alt="Loading..." className="loading-gif" />
        </div>
      )}
    </div>
  );
};

export default Classify;
