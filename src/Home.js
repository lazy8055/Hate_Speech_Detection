import React from 'react';
import './Home.css';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const Home = ({ onNavigate }) => {
  React.useEffect(() => {
    const backgroundEffect = HALO({
      el: "#vanta-background",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      THREE,
    });

    return () => {
      if (backgroundEffect) backgroundEffect.destroy();
    };
  }, []);

  return (
    <div className="home-page">
      <div id="vanta-background"></div>
      <div className="home-content">
        <h1 style={{ color: 'white' }}>Welcome to Detoxify!</h1>
        <p style={{ color: 'white',fontSize: '1.5em' }}>
        Hate Speech Detection powered by AI, enhancing user safety and awareness through Explainable AI for transparent and accountable decision-making
        </p>
        <button className="home-cta-button" onClick={() => onNavigate('classify')}>Get started</button>
      </div>
    </div>
  );
};

export default Home;
