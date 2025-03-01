/**
 * @module data-manager
 * @description Domain manager for the Data domain
 * @domain Data
 * @responsibility Manages data collection, statistics and performance monitoring
 */

import { getAllOrganisms } from '../organism/organism-manager';
import { getGenerationCount } from '../evolution/evolution-manager';

// Internal state
let simulationStats = {
  startTime: null,
  lastUpdateTime: null,
  frameCount: 0,
  fps: 0,
  populationHistory: [],
  traitHistory: []
};

/**
 * Initializes the data tracking system
 * @returns {boolean} Success status
 */
export function initializeDataTracking() {
  try {
    // Reset stats
    simulationStats = {
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      frameCount: 0,
      fps: 0,
      populationHistory: [],
      traitHistory: []
    };
    
    console.log('Data tracking system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize data tracking:', error);
    return false;
  }
}

/**
 * Updates the simulation statistics
 */
export function updateStatistics() {
  // Calculate FPS
  const now = Date.now();
  const elapsed = now - simulationStats.lastUpdateTime;
  
  if (elapsed >= 1000) { // Update every second
    simulationStats.fps = Math.round((simulationStats.frameCount * 1000) / elapsed);
    simulationStats.frameCount = 0;
    simulationStats.lastUpdateTime = now;
    
    // Record population and trait statistics
    recordPopulationStats();
  }
  
  simulationStats.frameCount++;
}

/**
 * Records current population statistics
 */
function recordPopulationStats() {
  const organisms = getAllOrganisms();
  
  if (organisms.length === 0) return;
  
  // Calculate averages
  const averageStats = calculateAverageStats(organisms);
  
  // Save to history (limited to last 100 entries)
  simulationStats.populationHistory.push({
    timestamp: Date.now(),
    count: organisms.length,
    generation: getGenerationCount()
  });
  
  if (simulationStats.populationHistory.length > 100) {
    simulationStats.populationHistory.shift();
  }
  
  simulationStats.traitHistory.push({
    timestamp: Date.now(),
    averageStats
  });
  
  if (simulationStats.traitHistory.length > 100) {
    simulationStats.traitHistory.shift();
  }
}

/**
 * Calculates average statistics for a population of organisms
 * @param {Array} organisms - Array of organism objects
 * @returns {Object} Average statistics
 */
function calculateAverageStats(organisms) {
  if (!organisms || organisms.length === 0) {
    return {
      bodySize: 0,
      bodyShape: 0,
      metabolism: 0,
      sensorRange: 0,
      energy: 0,
      age: 0
    };
  }
  
  // Initialize sums
  const sums = {
    bodySize: 0,
    bodyShape: 0,
    metabolism: 0,
    sensorRange: 0,
    energy: 0,
    age: 0
  };
  
  // Sum values
  organisms.forEach(organism => {
    if (organism.genome.bodySize) sums.bodySize += organism.genome.bodySize.value || 0;
    if (organism.genome.bodyShape) sums.bodyShape += organism.genome.bodyShape.value || 0;
    if (organism.genome.metabolism) sums.metabolism += organism.genome.metabolism.value || 0;
    if (organism.genome.sensorRange) sums.sensorRange += organism.genome.sensorRange.value || 0;
    
    if (organism.state) {
      sums.energy += organism.state.energy || 0;
      sums.age += organism.state.age || 0;
    }
  });
  
  // Calculate averages
  const count = organisms.length;
  return {
    bodySize: sums.bodySize / count,
    bodyShape: sums.bodyShape / count,
    metabolism: sums.metabolism / count,
    sensorRange: sums.sensorRange / count,
    energy: sums.energy / count,
    age: sums.age / count
  };
}

/**
 * Gets the current statistics for the simulation
 * @returns {Object} Current statistics
 */
export function getStatistics() {
  const organisms = getAllOrganisms();
  
  return {
    fps: simulationStats.fps,
    populationSize: organisms.length,
    currentGeneration: getGenerationCount(),
    runTime: Math.floor((Date.now() - simulationStats.startTime) / 1000),
    averageStats: calculateAverageStats(organisms),
    populationHistory: [...simulationStats.populationHistory],
    traitHistory: [...simulationStats.traitHistory]
  };
}

/**
 * Gets the performance metrics
 * @returns {Object} Performance metrics
 */
export function getPerformanceMetrics() {
  return {
    fps: simulationStats.fps,
    lastUpdateTime: simulationStats.lastUpdateTime,
    runTime: Math.floor((Date.now() - simulationStats.startTime) / 1000)
  };
}

/**
 * Exports the simulation data as JSON
 * @returns {string} JSON string of simulation data
 */
export function exportSimulationData() {
  const data = {
    timestamp: Date.now(),
    statistics: getStatistics(),
    organisms: getAllOrganisms()
  };
  
  return JSON.stringify(data, null, 2);
}
