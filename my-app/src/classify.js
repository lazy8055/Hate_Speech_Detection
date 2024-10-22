import React, { useState } from 'react';
import Tesseract from 'tesseract.js'; // Import Tesseract.js for OCR
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; // Import SpeechRecognition
import './classify.css';

const Classify = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('Logistic Regression');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading
  const [image, setImage] = useState(null); // State for image

  // Speech recognition hook
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); // Set the image file

      // Use Tesseract.js to extract text from the image
      Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => console.log(m), // Optional: log progress
        }
      ).then(({ data: { text } }) => {
        setText(text); // Set extracted text in state
      }).catch(err => {
        setError('Error extracting text from image.');
        console.error(err);
      });
    }
  };

  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle audio file and convert speech to text
      const reader = new FileReader();
      reader.onload = () => {
        const audio = new Audio(reader.result);
        audio.play();

        // Start speech recognition
        SpeechRecognition.startListening({ continuous: false });
        // Reset transcript before listening to new audio
        resetTranscript();
      };

      reader.readAsDataURL(file);
    }
  };

  // Effect to update text with the recognized speech
  React.useEffect(() => {
    if (transcript) {
      setText(transcript); // Update text state with recognized transcript
    }
  }, [transcript]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Clear previous result and error
    setResult(null);
    setError(null);

    setLoading(true); // Show loading animation

    const formData = new FormData();
    formData.append('text', text); // Use text state for classification
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

        <label htmlFor="image">Upload Image:</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />

        <label htmlFor="audio">Upload Audio:</label>
        <input
          type="file"
          id="audio"
          accept="audio/*"
          onChange={handleAudioChange}
        />

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
