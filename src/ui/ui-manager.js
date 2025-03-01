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

// Internal state
let canvasContext = null;
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
  
  // Get the canvas context
  canvasContext = canvas.getContext('2d');
  
  // Initial canvas setup
  canvasContext.fillStyle = CONSTANTS.CANVAS.BACKGROUND_COLOR;
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  
  console.log('Canvas initialized with dimensions:', canvas.width, 'x', canvas.height);
}

/**
 * Initializes the control panel
 */
function initializeControlPanel() {
  // In the Foundation Phase, we'll inject a simple set of controls into the DOM
  // In a full implementation, this would be a React component
  
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
  if (!canvasContext) {
    console.error('Cannot refresh canvas: context not initialized');
    return;
  }
  
  const canvas = canvasContext.canvas;
  
  // Clear canvas
  canvasContext.fillStyle = CONSTANTS.CANVAS.BACKGROUND_COLOR;
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  
  // Get current state
  const organisms = getAllOrganisms();
  const environment = getEnvironment();
  
  // Draw resources
  drawResources(environment.resources);
  
  // Draw organisms
  drawOrganisms(organisms);
  
  // Update statistics display
  updateStatsDisplay();
}

/**
 * Draws resources on the canvas
 * @param {Array} resources - Array of resource objects
 */
function drawResources(resources) {
  if (!canvasContext || !resources) return;
  
  canvasContext.fillStyle = '#8BC34A'; // Green for resources
  
  resources.forEach(resource => {
    canvasContext.beginPath();
    canvasContext.arc(
      resource.position.x,
      resource.position.y,
      3, // Resource size
      0,
      Math.PI * 2
    );
    canvasContext.fill();
  });
}

/**
 * Draws organisms on the canvas
 * @param {Array} organisms - Array of organism objects
 */
function drawOrganisms(organisms) {
  if (!canvasContext || !organisms) return;
  
  organisms.forEach(organism => {
    // Map genome values to visual properties
    const size = mapGenomeToSize(organism.genome.bodySize?.value || 0.5);
    const hue = mapGenomeToColor(organism.genome.bodyShape?.value || 0.5);
    
    // Draw body
    canvasContext.fillStyle = `hsl(${hue}, 70%, 50%)`;
    canvasContext.beginPath();
    canvasContext.arc(
      organism.state.position.x,
      organism.state.position.y,
      size,
      0,
      Math.PI * 2
    );
    canvasContext.fill();
    
    // Draw direction indicator (simple line)
    const angle = Math.atan2(organism.state.velocity.y, organism.state.velocity.x);
    canvasContext.strokeStyle = 'black';
    canvasContext.beginPath();
    canvasContext.moveTo(organism.state.position.x, organism.state.position.y);
    canvasContext.lineTo(
      organism.state.position.x + Math.cos(angle) * (size + 5),
      organism.state.position.y + Math.sin(angle) * (size + 5)
    );
    canvasContext.stroke();
    
    // Draw any appendages here in the future
  });
}

/**
 * Maps genome body size value to visual size
 * @param {number} value - Normalized genome value (0-1)
 * @returns {number} Visual size in pixels
 */
function mapGenomeToSize(value) {
  return CONSTANTS.ORGANISM.MIN_SIZE + 
    value * (CONSTANTS.ORGANISM.MAX_SIZE - CONSTANTS.ORGANISM.MIN_SIZE);
}

/**
 * Maps genome body shape value to color hue
 * @param {number} value - Normalized genome value (0-1)
 * @returns {number} Hue value (0-360)
 */
function mapGenomeToColor(value) {
  return value * 360; // Map 0-1 to 0-360 hue
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
  const canvas = document.getElementById('simulation-canvas');
  if (canvas) {
    canvas.width = width || CONSTANTS.CANVAS.DEFAULT_WIDTH;
    canvas.height = height || CONSTANTS.CANVAS.DEFAULT_HEIGHT;
    
    // Refresh canvas with new dimensions
    refreshCanvas();
    
    console.log('Canvas dimensions updated:', canvas.width, 'x', canvas.height);
  }
}

/**
 * Renders the simulation to the canvas
 * @param {Object} state - Current simulation state
 */
export function renderSimulation(state) {
  // Simplified version for Foundation Phase
  refreshCanvas();
}
