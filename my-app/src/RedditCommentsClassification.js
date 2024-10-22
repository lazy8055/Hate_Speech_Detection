import React, { useState } from 'react';
import './RedditCommentsClassification.css';

const RedditCommentsClassification = () => {
  const [postUrl, setPostUrl] = useState('');
  const [commentsResult, setCommentsResult] = useState('');
  const [pieChart, setPieChart] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    setCommentsResult('');
    setPieChart('');
    setError('');
    
    setLoading(true); 
    
    const formData = new FormData();
    formData.append('post_url', postUrl);
    
    fetch('http://127.0.0.1:5000/fetch_and_classify', {
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
          <h3>All Comments</h3>
          <div class="scrollable-table">
            ${data.comments_html}
          </div>
          <h3>Hate Speech Comments</h3>
          <div class="scrollable-table">
          ${data.hate_speech_html}
          </div>
        `);
        setPieChart(`
          <h3>Comments Distribution</h3>
          <img src="data:image/png;base64,${data.pie_chart_img}" alt="Pie Chart" />
        `);
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

  const handleNotifyAll = () => {
    const formData = new FormData();
    formData.append('post_url', postUrl);
    
    setLoading(true);

    fetch('http://127.0.0.1:5000/notify_all_hatespeech_users', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('All hate speech commenters have been notified.');
      } else {
        setError(data.error);
      }
      setLoading(false); 
    })
    .catch(err => {
      console.error('Error:', err);
      setError('An error occurred while sending notifications.');
      setLoading(false); 
    });
  };

  return (
    <div className="container" style={{ width: '60%',       
    maxWidth: '800px',   
    minWidth: '400px',}}>
      <h1>Reddit Comments Classification</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="post_url"
          name="post_url"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="Enter Reddit Post URL"
        />
        <button type="submit">Fetch and Classify Comments</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div id="comments-result" className="result" dangerouslySetInnerHTML={{ __html: commentsResult }}></div>
      <div id="pie-chart" className="result" dangerouslySetInnerHTML={{ __html: pieChart }}></div>

      {commentsResult && (
        <button onClick={handleNotifyAll} disabled={loading || !commentsResult}>Notify All</button>
      )}
      
      {loading && (
        <div className="loading-container">
          <img src="./a.gif" alt="Loading..." className="loading-gif" />
        </div>
      )}
    </div>
  );
};

export default RedditCommentsClassification;
