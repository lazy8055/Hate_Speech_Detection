import React, { useState } from 'react';
import Tesseract from 'tesseract.js'; 
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; 
import './classify.css';

const Classify = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('Logistic Regression');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); 

  
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); 

      
      Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => console.log(m), 
        }
      ).then(({ data: { text } }) => {
        setText(text); 
      }).catch(err => {
        setError('Error extracting text from image.');
        console.error(err);
      });
    }
  };

  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('audio', file);
  
      fetch('http://127.0.0.1:5000/transcribe', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setText(data.transcription);
          setError(null);
        }
      })
      .catch(err => {
        setError('An error occurred while processing the audio file.');
        console.error(err);
      });
    }
  };

  


  const handleSubmit = (event) => {
    event.preventDefault();

    
    setResult(null);
    setError(null);

    setLoading(true); 

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
      setLoading(false); 
    })
    .catch(err => {
      setError('An error occurred while processing the request.');
      setResult(null);
      setLoading(false); 
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
        <br></br>
        <br></br>
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
        <br></br>
        <br></br>
        <label htmlFor="image">Upload Image:</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
<br></br>
        <br></br>
        <label htmlFor="audio">Upload Audio:</label>
        <input
          type="file"
          id="audio"
          accept="audio/*"
          onChange={handleAudioChange}
        />
<br></br>
        <br></br>
        <br></br>
        <br></br>
        <div style={{display:'flex',justifyContent:'center'}}>
        <button type="submit">Classify</button>
        </div>
       
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
