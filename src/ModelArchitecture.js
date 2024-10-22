import React from 'react';
import './ModelArchitecture.css'; 

const ModelArchitecture = () => {
  return (
    <div className="container">
      <h1>Model Architecture Analysis</h1>
      <p className="description">
        Explore the output layer activations and attention layer heads for the model architecture.
      </p>

      <div className="chart-container">
        <div className="chart">
          <h2>Output Layer Activation Graph</h2>
          <img src="output_layer_activations.png" alt="Output Layer Activation Graph" />
        </div>
        <div className="chart">
          <h2>Attention Layer Head Graph</h2>
          <img src="attention_layer_0_head_0.png" alt="Attention Layer Head Graph" />
        </div>
      </div>
    </div>
  );
};

export default ModelArchitecture;
