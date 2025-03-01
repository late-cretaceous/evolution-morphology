/**
 * @module ui-manager
 * @description Domain manager for the UI domain
 * @domain UI
 * @responsibility Manages all UI components, rendering, and user interactions
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { CONSTANTS } from '../utils/core';
import { getAllOrganisms } from '../organism/organism-manager';
import { getEnvironment } from '../simulation/simulation-manager';
import { getStatistics } from '../data/data-manager';
import { 
  initializeRenderer, 
  clearCanvas, 
  renderOrganism, 
  renderResource,
  setCanvasDimensions as setCanvasRendererDimensions,
  getCanvasDimensions
} from './canvas-renderer';

// Internal state
let canvasElement = null;
let controlCallbacks = {
  onStart: null,
  onStop: null,
  onReset: null,
  onSpeedChange: null
};

/**
 * Initializes the UI system
 * @param {Object} callbacks - Event callbacks for controls
 * @returns {boolean} Success status
 */
export function initializeUI(callbacks = {}) {
  try {
    // Store control callbacks
    controlCallbacks = {
      ...controlCallbacks,
      ...callbacks
    };
    
    // Initialize the canvas
    initializeCanvas();
    
    // Initialize control panel
    initializeControlPanel();
    
    console.log('UI system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize UI:', error);
    return false;
  }
}

/**
 * Initializes the canvas for rendering
 */
function initializeCanvas() {
  // Create canvas element if it doesn't exist
  let canvas = document.getElementById('simulation-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'simulation-canvas';
    canvas.width = CONSTANTS.CANVAS.DEFAULT_WIDTH;
    canvas.height = CONSTANTS.CANVAS.DEFAULT_HEIGHT;
    
    const container = document.getElementById('simulation-container');
    if (container) {
      container.appendChild(canvas);
    } else {
      document.body.appendChild(canvas);
    }
  }
  
  canvasElement = canvas;
  
  // Initialize the canvas renderer
  initializeRenderer(canvas);
  
  console.log('Canvas initialized with dimensions:', canvas.width, 'x', canvas.height);
}

/**
 * Initializes the control panel
 */
function initializeControlPanel() {
  // Create control panel if it doesn't exist
  let controlPanel = document.getElementById('control-panel');
  if (!controlPanel) {
    controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.style.padding = '10px';
    controlPanel.style.marginTop = '10px';
    controlPanel.style.border = '1px solid #ccc';
    
    // Create basic controls
    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.onclick = () => {
      if (controlCallbacks.onStart) controlCallbacks.onStart();
    };
    
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.onclick = () => {
      if (controlCallbacks.onStop) controlCallbacks.onStop();
    };
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = () => {
      if (controlCallbacks.onReset) controlCallbacks.onReset();
    };
    
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed: ';
    
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = CONSTANTS.SIMULATION.MIN_SPEED;
    speedSlider.max = CONSTANTS.SIMULATION.MAX_SPEED;
    speedSlider.step = 0.1;
    speedSlider.value = CONSTANTS.SIMULATION.DEFAULT_SPEED;
    speedSlider.oninput = (e) => {
      if (controlCallbacks.onSpeedChange) {
        controlCallbacks.onSpeedChange(parseFloat(e.target.value));
      }
    };
    
    // Append controls to panel
    controlPanel.appendChild(startButton);
    controlPanel.appendChild(document.createTextNode(' '));
    controlPanel.appendChild(stopButton);
    controlPanel.appendChild(document.createTextNode(' '));
    controlPanel.appendChild(resetButton);
    controlPanel.appendChild(document.createElement('br'));
    controlPanel.appendChild(document.createElement('br'));
    controlPanel.appendChild(speedLabel);
    controlPanel.appendChild(speedSlider);
    
    // Create stats display
    const statsDisplay = document.createElement('div');
    statsDisplay.id = 'stats-display';
    statsDisplay.style.marginTop = '10px';
    controlPanel.appendChild(statsDisplay);
    
    // Add to container
    const container = document.getElementById('simulation-container');
    if (container) {
      container.appendChild(controlPanel);
    } else {
      document.body.appendChild(controlPanel);
    }
  }
  
  console.log('Control panel initialized');
}

/**
 * Refreshes the canvas with the current simulation state
 */
export function refreshCanvas() {
  if (!canvasElement) {
    console.error('Cannot refresh canvas: canvas element not initialized');
    return;
  }
  
  // Clear canvas
  clearCanvas();
  
  // Get current state
  const organisms = getAllOrganisms();
  const environment = getEnvironment();
  
  // Draw resources
  environment.resources.forEach(resource => {
    renderResource(resource);
  });
  
  // Draw organisms
  organisms.forEach(organism => {
    renderOrganism(organism);
  });
  
  // Update statistics display
  updateStatsDisplay();
}

/**
 * Updates the statistics display
 */
function updateStatsDisplay() {
  const statsDisplay = document.getElementById('stats-display');
  if (!statsDisplay) return;
  
  const statistics = getStatistics();
  if (!statistics) return;
  
  // Create readable statistics HTML
  let statsHtml = '<h3>Simulation Statistics</h3>';
  statsHtml += `<p>Population: ${statistics.populationSize}</p>`;
  statsHtml += `<p>Generation: ${statistics.currentGeneration}</p>`;
  
  if (statistics.averageStats) {
    statsHtml += '<h4>Average Traits:</h4>';
    statsHtml += `<p>Body Size: ${statistics.averageStats.bodySize.toFixed(2)}</p>`;
    statsHtml += `<p>Body Shape: ${statistics.averageStats.bodyShape.toFixed(2)}</p>`;
    statsHtml += `<p>Metabolism: ${statistics.averageStats.metabolism.toFixed(2)}</p>`;
    statsHtml += `<p>Speed: ${statistics.averageStats.speed?.toFixed(2) || 'N/A'}</p>`;
  }
  
  // Update the display
  statsDisplay.innerHTML = statsHtml;
}

/**
 * Sets the canvas dimensions
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function setCanvasDimensions(width, height) {
  if (canvasElement) {
    // Update canvas element dimensions
    canvasElement.width = width || CONSTANTS.CANVAS.DEFAULT_WIDTH;
    canvasElement.height = height || CONSTANTS.CANVAS.DEFAULT_HEIGHT;
    
    // Update canvas renderer dimensions
    setCanvasRendererDimensions(canvasElement.width, canvasElement.height);
    
    // Refresh canvas with new dimensions
    refreshCanvas();
    
    console.log('Canvas dimensions updated:', canvasElement.width, 'x', canvasElement.height);
  }
}

/**
 * Renders the simulation to the canvas
 * @param {Object} state - Current simulation state
 */
export function renderSimulation(state) {
  // Delegate to refreshCanvas for rendering
  refreshCanvas();
}