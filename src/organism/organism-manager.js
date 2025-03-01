/**
 * @module organism-manager
 * @description Domain manager for the Organism domain
 * @domain Organism
 * @responsibility Manages organism lifecycle, morphology and behaviors
 */

import { CONSTANTS, generateId, deepClone } from '../utils/core';

// Internal state - not accessible outside this domain
let organisms = [];
let nextOrganismId = 1;

/**
 * Initializes the organism system
 * @returns {boolean} Success status
 */
export function initializeOrganismSystem() {
  try {
    organisms = [];
    console.log('Organism system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize organism system:', error);
    return false;
  }
}

/**
 * Creates a new organism with default properties
 * @param {Object} properties - Optional properties to override defaults
 * @returns {Object} The created organism
 */
export function createOrganism(properties = {}) {
  const defaultOrganism = {
    id: generateId(),
    genome: generateDefaultGenome(),
    phenotype: {
      bodySize: 0.5,
      bodyShape: 0.5,
      appendages: []
    },
    state: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      energy: CONSTANTS.ORGANISM.DEFAULT_ENERGY,
      age: 0
    }
  };

  // Merge default organism with provided properties
  const organism = {
    ...defaultOrganism,
    ...properties,
    state: {
      ...defaultOrganism.state,
      ...(properties.state || {})
    }
  };

  organisms.push(organism);
  return organism;
}

/**
 * Creates an initial population of organisms
 * @param {number} count - Number of organisms to create
 * @param {Object} environmentBounds - Environment boundaries
 * @returns {Array} Array of created organisms
 */
export function createInitialPopulation(count, environmentBounds) {
  const population = [];
  
  for (let i = 0; i < count; i++) {
    // Create organism with random position within environment bounds
    const organism = createOrganism({
      state: {
        position: {
          x: Math.random() * environmentBounds.width,
          y: Math.random() * environmentBounds.height
        }
      }
    });
    
    population.push(organism);
  }
  
  return population;
}

/**
 * Retrieves all organisms
 * @returns {Array} Array of all organisms
 */
export function getAllOrganisms() {
  // Return a copy to prevent external modification
  return deepClone(organisms);
}

/**
 * Updates all organisms based on the current simulation state
 * @param {number} deltaTime - Time elapsed since last update
 * @param {Object} environment - Current environment state
 */
export function updateOrganisms(deltaTime, environment) {
  // This will be implemented in the Organism Phase
  // For now, just a placeholder
  console.log(`Updating ${organisms.length} organisms`);
}

/**
 * Generates a default genome for a new organism
 * @returns {Object} Default genome
 */
function generateDefaultGenome() {
  return {
    bodySize: { value: 0.5, mutationRate: 0.03 },
    bodyShape: { value: 0.5, mutationRate: 0.02 },
    metabolism: { value: 0.5, mutationRate: 0.03 },
    sensorRange: { value: 0.5, mutationRate: 0.02 },
    appendages: []
  };
}

/**
 * Removes an organism from the simulation
 * @param {string} organismId - ID of the organism to remove
 * @returns {boolean} Success status
 */
export function removeOrganism(organismId) {
  const initialLength = organisms.length;
  organisms = organisms.filter(o => o.id !== organismId);
  return organisms.length < initialLength;
}

/**
 * Retrieves an organism by ID
 * @param {string} organismId - ID of the organism to retrieve
 * @returns {Object|null} The organism or null if not found
 */
export function getOrganismById(organismId) {
  const organism = organisms.find(o => o.id === organismId);
  return organism ? deepClone(organism) : null;
}
