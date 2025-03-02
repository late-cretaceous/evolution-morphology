/**
 * @module simulation-manager
 * @description Domain manager for the Simulation domain
 * @domain Simulation
 * @responsibility Manages simulation state, environment, and timing
 */

import { CONSTANTS } from '../utils/core';
import { updateOrganisms, createInitialPopulation, getAllOrganisms } from '../organism/organism-manager';
import { applySelection } from '../evolution/evolution-manager';
import { refreshCanvas } from '../ui/ui-manager';
import { updateStatistics } from '../data/data-manager';

// Internal state
let isRunning = false;
let simulationSpeed = CONSTANTS.SIMULATION.DEFAULT_SPEED;
let lastTimestamp = 0;
let animationFrameId = null;
let environment = {
  resources: [],
  boundaries: {
    width: CONSTANTS.CANVAS.DEFAULT_WIDTH,
    height: CONSTANTS.CANVAS.DEFAULT_HEIGHT
  },
  parameters: {
    resourceRegenerationRate: CONSTANTS.RESOURCE.REGENERATION_RATE,
    maxResources: CONSTANTS.RESOURCE.MAX_RESOURCES
  }
};

/**
 * Initializes the simulation system
 * @returns {boolean} Success status
 */
export function initializeSimulation() {
  try {
    // Reset simulation state
    isRunning = false;
    simulationSpeed = CONSTANTS.SIMULATION.DEFAULT_SPEED;
    lastTimestamp = 0;
    
    // Set up environment
    initializeEnvironment();
    
    // Create initial population
    createInitialPopulation(
      CONSTANTS.SIMULATION.DEFAULT_POPULATION_SIZE,
      environment.boundaries
    );
    
    console.log('Simulation system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize simulation:', error);
    return false;
  }
}

/**
 * Initializes the simulation environment
 */
function initializeEnvironment() {
  // Create resources
  generateResources();
  
  console.log('Environment initialized with dimensions:', 
    environment.boundaries.width, 'x', environment.boundaries.height);
}

/**
 * Generates initial resources in the environment
 */
function generateResources() {
  environment.resources = [];
  
  const resourceCount = Math.floor(environment.parameters.maxResources / 2);
  
  for (let i = 0; i < resourceCount; i++) {
    environment.resources.push({
      id: `resource-${i}`,
      type: 'food',
      position: {
        x: Math.random() * environment.boundaries.width,
        y: Math.random() * environment.boundaries.height
      },
      value: CONSTANTS.RESOURCE.DEFAULT_VALUE
    });
  }
}

/**
 * Starts the simulation
 * @param {number} speed - Simulation speed multiplier
 */
export function startSimulation(speed = CONSTANTS.SIMULATION.DEFAULT_SPEED) {
  if (!isRunning) {
    isRunning = true;
    simulationSpeed = speed;
    lastTimestamp = performance.now();
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(simulationLoop);
    console.log(`Simulation started with speed ${simulationSpeed}`);
  } else {
    // If already running, just update the speed
    simulationSpeed = speed;
    console.log(`Simulation speed updated to ${simulationSpeed}`);
  }
}

/**
 * Stops the simulation
 */
export function stopSimulation() {
  if (isRunning) {
    isRunning = false;
    
    // Stop the animation loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    console.log('Simulation stopped');
  }
}

/**
 * Resets the simulation to initial state
 */
export function resetSimulation() {
  stopSimulation();
  initializeSimulation();
  console.log('Simulation reset');
}

/**
 * Main simulation loop
 * @param {number} timestamp - Current timestamp from requestAnimationFrame
 */
function simulationLoop(timestamp) {
  if (!isRunning) return;
  
  // Calculate time delta
  const deltaTime = (timestamp - lastTimestamp) / 1000 * simulationSpeed;
  lastTimestamp = timestamp;
  
  // Update simulation state
  updateSimulation(deltaTime);
  
  // Render the current state
  refreshCanvas();
  
  // Update statistics periodically
  updateStatistics();
  
  // Continue the loop
  animationFrameId = requestAnimationFrame(simulationLoop);
}

/**
 * Updates the simulation state for a time step
 * @param {number} deltaTime - Time elapsed since last update, adjusted for simulation speed
 */
function updateSimulation(deltaTime) {
  // Update resources
  updateResources(deltaTime);
  
  // Update organisms
  updateOrganisms(deltaTime, environment);
  
  // Apply selection pressure with all organisms and environment
  applySelection(getAllOrganisms(), environment);
}

/**
 * Updates resources in the environment
 * @param {number} deltaTime - Time elapsed since last update
 */
function updateResources(deltaTime) {
  // Regenerate resources over time
  if (environment.resources.length < environment.parameters.maxResources) {
    // Calculate how many resources to add based on regeneration rate
    const resourcesNeeded = environment.parameters.maxResources - environment.resources.length;
    const resourcesToAdd = Math.min(
      resourcesNeeded,
      Math.random() < environment.parameters.resourceRegenerationRate * deltaTime ? 1 : 0
    );
    
    // Add new resources
    for (let i = 0; i < resourcesToAdd; i++) {
      environment.resources.push({
        id: `resource-${Date.now()}-${i}`,
        type: 'food',
        position: {
          x: Math.random() * environment.boundaries.width,
          y: Math.random() * environment.boundaries.height
        },
        value: CONSTANTS.RESOURCE.DEFAULT_VALUE
      });
    }
  }
}

/**
 * Gets the current environment state
 * @returns {Object} Current environment state
 */
export function getEnvironment() {
  return { ...environment };
}

/**
 * Sets environment boundaries
 * @param {number} width - Environment width
 * @param {number} height - Environment height
 */
export function setEnvironmentBoundaries(width, height) {
  environment.boundaries = {
    width: width || CONSTANTS.CANVAS.DEFAULT_WIDTH,
    height: height || CONSTANTS.CANVAS.DEFAULT_HEIGHT
  };
}