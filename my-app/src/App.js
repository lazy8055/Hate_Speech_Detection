import React, { useState } from 'react';
import MetricsDashboard from './MetricsDashboard';
import ModelArchitecture from './ModelArchitecture';
import Home from './Home';
import RedditCommentsClassification from './RedditCommentsClassification';
import Classify from './classify';
import BackgroundAnimation from './BackgroundAnimation';
import Profilescore from './profilescore';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('Home'); // State to handle current page

  // Function to handle page navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-brand">Detoxify</div>
        <div className="navbar-container">
        <div className="navbar-links">
          <a href="#home" onClick={() => navigateTo('Home')}>Home</a>
          <a href="#metrics" onClick={() => navigateTo('metrics')}>Metrics Dashboard</a>
          <a href="#architecture" onClick={() => navigateTo('architecture')}>Model Architecture Analysis</a>
          <a href="#reddit-classification" onClick={() => navigateTo('reddit-classification')}>Reddit Comments Classification</a>
          <a href="#classify" onClick={() => navigateTo('classify')}>Classify</a>
          <a href="#profilescore" onClick={() => navigateTo('profilescore')}>ProfileScore</a>
          

        </div>
        </div>
      </nav>

      {/* Conditionally render components based on the currentPage state */}
      {currentPage === 'Home' && <Home onNavigate={navigateTo} />}
      {currentPage === 'metrics' && <MetricsDashboard />}
      {currentPage === 'architecture' && <ModelArchitecture />}
      {currentPage === 'reddit-classification' && <RedditCommentsClassification />}
      {currentPage === 'classify' && <Classify />}
      {currentPage === 'profilescore' && <Profilescore/>}
      
      {/* Conditionally render BackgroundAnimation based on the current page */}
      {currentPage !== 'Home' && <BackgroundAnimation />}
    </div>
  );
}

export default App;
