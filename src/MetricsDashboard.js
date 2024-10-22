import React from 'react';
import './MetricsDashboard.css'; 

const MetricsDashboard = () => {
  return (
    <div className="container">
      <h1>Model Metrics and Confusion Matrices</h1>
      
      <div className="chart-container">
        <div className="chart">
          <h2>Traditional Models Metrics</h2>
          <img src="./traditional_models_metrics.png" alt="Traditional Models Metrics" />
        </div>
        <div className="chart">
          <h2>BERT Model Metrics</h2>
          <img src="bert_model_metrics.png" alt="BERT Model Metrics" />
        </div>
      </div>
      <h2>Confusion Matrices for Different Models</h2>
      <div className="confusion-matrix">
        
        
        <h3>Random Forest</h3>
        <img src="confusion_matrix_rf.png" alt="Confusion Matrix - Random Forest" />
        
        <h3>Decision Tree</h3>
        <img src="confusion_matrix_dt.png" alt="Confusion Matrix - Decision Tree" />
        
        <h3>Logistic Regression</h3>
        <img src="confusion_matrix_lr.png" alt="Confusion Matrix - Logistic Regression" />
        
        <h3>BERT Model</h3>
        <img src="confusion_matrix_approx.png" alt="Confusion Matrix - BERT Model" />
      </div>
    </div>
  );
};

export default MetricsDashboard;
