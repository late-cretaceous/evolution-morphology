/**
 * @module control-panel
 * @description Manages simulation control UI components
 * @domain UI
 * @private Should only be used by ui-manager.js
 */

import React from 'react';
import { CONSTANTS } from '../utils/core';

/**
 * Creates the control panel component
 * @param {Object} props - Component properties
 * @param {Function} props.onStart - Start button click handler
 * @param {Function} props.onStop - Stop button click handler
 * @param {Function} props.onReset - Reset button click handler
 * @param {Function} props.onSpeedChange - Speed slider change handler
 * @param {Function} props.onPopulationSizeChange - Population size input change handler
 * @param {Function} props.onMutationRateChange - Mutation rate slider change handler
 * @param {boolean} props.isRunning - Whether the simulation is currently running
 * @param {number} props.simulationSpeed - Current simulation speed
 * @param {number} props.populationSize - Current population size
 * @param {number} props.mutationRate - Current mutation rate
 * @returns {JSX.Element} The control panel component
 */
export function ControlPanel({
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onPopulationSizeChange,
  onMutationRateChange,
  isRunning = false,
  simulationSpeed = CONSTANTS.SIMULATION.DEFAULT_SPEED,
  populationSize = CONSTANTS.SIMULATION.DEFAULT_POPULATION_SIZE,
  mutationRate = CONSTANTS.EVOLUTION.DEFAULT_MUTATION_RATE
}) {
  return (
    <div className="control-panel">
      <h3>Simulation Controls</h3>
      
      <div className="control-section">
        <button 
          onClick={onStart}
          disabled={isRunning}
          className={`control-button ${isRunning ? 'disabled' : 'primary'}`}
        >
          Start
        </button>
        
        <button 
          onClick={onStop}
          disabled={!isRunning}
          className={`control-button ${!isRunning ? 'disabled' : 'secondary'}`}
        >
          Stop
        </button>
        
        <button 
          onClick={onReset}
          className="control-button danger"
        >
          Reset
        </button>
      </div>
      
      <div className="control-section">
        <label className="control-label">
          Simulation Speed: {simulationSpeed.toFixed(1)}x
          <input 
            type="range"
            min={CONSTANTS.SIMULATION.MIN_SPEED}
            max={CONSTANTS.SIMULATION.MAX_SPEED}
            step={0.1}
            value={simulationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="slider"
          />
          <span className="range-label">
            <span>{CONSTANTS.SIMULATION.MIN_SPEED}x</span>
            <span>{CONSTANTS.SIMULATION.MAX_SPEED}x</span>
          </span>
        </label>
      </div>
      
      <div className="control-section">
        <label className="control-label">
          Population Size: {populationSize}
          <input 
            type="number"
            min={1}
            max={200}
            value={populationSize}
            onChange={(e) => onPopulationSizeChange(parseInt(e.target.value, 10))}
            disabled={isRunning}
            className={`number-input ${isRunning ? 'disabled' : ''}`}
          />
        </label>
      </div>
      
      <div className="control-section">
        <label className="control-label">
          Mutation Rate: {(mutationRate * 100).toFixed(1)}%
          <input 
            type="range"
            min={0}
            max={CONSTANTS.EVOLUTION.MAX_MUTATION_RATE}
            step={0.01}
            value={mutationRate}
            onChange={(e) => onMutationRateChange(parseFloat(e.target.value))}
            className="slider"
          />
          <span className="range-label">
            <span>0%</span>
            <span>{(CONSTANTS.EVOLUTION.MAX_MUTATION_RATE * 100).toFixed(0)}%</span>
          </span>
        </label>
      </div>
    </div>
  );
}

/**
 * Creates the statistics display component
 * @param {Object} props - Component properties
 * @param {Object} props.statistics - Current simulation statistics
 * @returns {JSX.Element} The statistics display component
 */
export function StatisticsDisplay({ statistics }) {
  if (!statistics) {
    return <div className="statistics-panel">Loading statistics...</div>;
  }
  
  const {
    fps,
    populationSize,
    currentGeneration,
    runTime,
    averageStats
  } = statistics;
  
  return (
    <div className="statistics-panel">
      <h3>Simulation Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">FPS</div>
          <div className="stat-value">{fps}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Population</div>
          <div className="stat-value">{populationSize}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Generation</div>
          <div className="stat-value">{currentGeneration}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Run Time</div>
          <div className="stat-value">{formatTime(runTime)}</div>
        </div>
      </div>
      
      {averageStats && (
        <>
          <h4>Average Traits</h4>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Body Size</div>
              <div className="stat-value">{averageStats.bodySize.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Body Shape</div>
              <div className="stat-value">{averageStats.bodyShape.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Metabolism</div>
              <div className="stat-value">{averageStats.metabolism.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Sensor Range</div>
              <div className="stat-value">{averageStats.sensorRange.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{averageStats.speed.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Turn Rate</div>
              <div className="stat-value">{averageStats.turnRate.toFixed(2)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Avg. Energy</div>
              <div className="stat-value">{averageStats.energy.toFixed(1)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Avg. Age</div>
              <div className="stat-value">{averageStats.age.toFixed(1)}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Appendages</div>
              <div className="stat-value">{averageStats.appendageCount.toFixed(1)}</div>
            </div>
          </div>
          
          <h4>Appendage Distribution</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Fins</div>
              <div className="stat-value">
                {averageStats.appendageTypes?.fin
                  ? (averageStats.appendageTypes.fin * populationSize).toFixed(0)
                  : '0'
                }
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Flagella</div>
              <div className="stat-value">
                {averageStats.appendageTypes?.flagella
                  ? (averageStats.appendageTypes.flagella * populationSize).toFixed(0)
                  : '0'
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Creates the organism detail panel component
 * @param {Object} props - Component properties
 * @param {Object} props.organism - The selected organism
 * @param {Function} props.onClose - Handler for closing the panel
 * @returns {JSX.Element} The organism detail panel component
 */
export function OrganismDetailPanel({ organism, onClose }) {
  if (!organism) {
    return null;
  }
  
  return (
    <div className="organism-detail-panel">
      <div className="detail-panel-header">
        <h3>Organism Details</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="detail-section">
        <h4>Basic Information</h4>
        <div className="info-row">
          <span>ID:</span>
          <span>{organism.id.substring(0, 8)}...</span>
        </div>
        <div className="info-row">
          <span>Age:</span>
          <span>{organism.state.age.toFixed(1)}s</span>
        </div>
        <div className="info-row">
          <span>Energy:</span>
          <span>{organism.state.energy.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="detail-section">
        <h4>Physical Traits</h4>
        <div className="info-row">
          <span>Body Size:</span>
          <span>{organism.phenotype.bodySize.toFixed(2)}</span>
        </div>
        <div className="info-row">
          <span>Body Shape:</span>
          <span>{organism.phenotype.bodyShape.toFixed(2)}</span>
        </div>
        <div className="info-row">
          <span>Metabolism:</span>
          <span>{organism.phenotype.metabolism.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="detail-section">
        <h4>Behavioral Traits</h4>
        <div className="info-row">
          <span>Speed:</span>
          <span>{organism.phenotype.speed.toFixed(2)}</span>
        </div>
        <div className="info-row">
          <span>Turn Rate:</span>
          <span>{organism.phenotype.turnRate.toFixed(2)}</span>
        </div>
        <div className="info-row">
          <span>Sensor Range:</span>
          <span>{organism.phenotype.sensorRange.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="detail-section">
        <h4>Appendages ({organism.phenotype.appendages.length})</h4>
        {organism.phenotype.appendages.map((app, index) => (
          <div key={index} className="appendage-info">
            <div className="info-row">
              <span>Type:</span>
              <span>{app.type}</span>
            </div>
            <div className="info-row">
              <span>Length:</span>
              <span>{app.length.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span>Position:</span>
              <span>{app.position.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span>Angle:</span>
              <span>{app.angle.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Formats seconds into a readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (mm:ss)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * The CSS styles for the control panel components
 * @type {Object}
 */
export const controlPanelStyles = {
  controlPanel: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f8f9fa'
  },
  
  controlSection: {
    marginBottom: '15px'
  },
  
  controlButton: {
    padding: '8px 16px',
    marginRight: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  
  primaryButton: {
    backgroundColor: '#4CAF50',
    color: 'white'
  },
  
  secondaryButton: {
    backgroundColor: '#FF9800',
    color: 'white'
  },
  
  dangerButton: {
    backgroundColor: '#F44336',
    color: 'white'
  },
  
  disabledButton: {
    backgroundColor: '#e0e0e0',
    color: '#a0a0a0',
    cursor: 'not-allowed'
  },
  
  controlLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  
  slider: {
    width: '100%',
    marginTop: '5px'
  },
  
  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666'
  },
  
  numberInput: {
    width: '60px',
    padding: '5px',
    marginLeft: '10px'
  },
  
  statisticsPanel: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#f8f9fa'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginBottom: '15px'
  },
  
  statItem: {
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#e9ecef'
  },
  
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px'
  },
  
  statValue: {
    fontWeight: 'bold',
    fontSize: '16px'
  },
  
  organismDetailPanel: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '250px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '15px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    maxHeight: '80vh',
    overflow: 'auto',
    zIndex: 10
  },
  
  detailPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee'
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666'
  },
  
  detailSection: {
    marginBottom: '15px'
  },
  
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px dotted #eee'
  },
  
  appendageInfo: {
    margin: '5px 0',
    padding: '8px',
    backgroundColor: '#f0f7ff',
    borderRadius: '4px'
  }
};