import React, { useState } from 'react';
import './RedditCommentsClassification.css';

const UserCommentsClassification = () => {
  const [username, setUsername] = useState('');
  const [commentsResult, setCommentsResult] = useState('');
  const [pieChart, setPieChart] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hateSpeechCount, setHateSpeechCount] = useState(0); 

  const handleSubmit = (e) => {
    e.preventDefault();

    
    setCommentsResult('');
    setPieChart('');
    setError('');
    setHateSpeechCount(0); 

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);

    fetch('http://127.0.0.1:5000/fetch_user_comments', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setCommentsResult('');
          setPieChart('');
        } else {
          setCommentsResult(`  
            <h3>User Comments</h3>
            <div class="scrollable-table">
              ${data.comments_html}
            </div>
          `);
          setPieChart(` 
            <h3>Comments Distribution</h3>
            <img src="data:image/png;base64,${data.pie_chart_img}" alt="Pie Chart" />
          `);
          
         
          setHateSpeechCount(data.hate_speech_count); 
          setError('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError('An error occurred while fetching the data.');
        setCommentsResult('');
        setPieChart('');
        setLoading(false);
      });
  };

  const sendWarningMessage = () => {
    const message = "test";
    const formData = new FormData();
    formData.append('username', username);
    formData.append('message', message);

    fetch('http://127.0.0.1:5000/send_warning_message', { 
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          alert("Warning message sent successfully!");
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setError('An error occurred while sending the message.');
      });
  };

  return (
    <div className="container"style={{ width: '60%',      
    maxWidth: '800px',    
    minWidth: '400px',}}>
      <h1>Reddit User Comments Classification</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Reddit Username"
        />
        <button type="submit">Fetch and Classify Comments</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div id="comments-result" className="result" dangerouslySetInnerHTML={{ __html: commentsResult }}></div>
      <div id="pie-chart" className="result" dangerouslySetInnerHTML={{ __html: pieChart }}></div>

      {loading && (
        <div className="loading-container">
          <img src="./a.gif" alt="Loading..." className="loading-gif" />
        </div>
      )}

    
      
        <button onClick={sendWarningMessage}>
          Send Warning Message
        </button>
      
    </div>
  );
};

export default UserCommentsClassification;
