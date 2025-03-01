/**
 * @module core
 * @description Core constants and foundational utilities used across all domains
 * @global Should be accessible to all modules
 */

// Simulation constants
export const CONSTANTS = {
  // Canvas configuration
  CANVAS: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    BACKGROUND_COLOR: '#f0f0f0'
  },
  
  // Simulation configuration
  SIMULATION: {
    DEFAULT_SPEED: 1.0,
    MIN_SPEED: 0.1,
    MAX_SPEED: 5.0,
    DEFAULT_POPULATION_SIZE: 20
  },
  
  // Organism configuration
  ORGANISM: {
    MIN_SIZE: 5,
    MAX_SIZE: 30,
    DEFAULT_ENERGY: 100,
    REPRODUCTION_ENERGY_THRESHOLD: 150,
    ENERGY_TRANSFER_RATIO: 0.8,  // How much energy is passed to offspring
    MOVEMENT_ENERGY_COST: 0.1
  },
  
  // Evolution configuration
  EVOLUTION: {
    DEFAULT_MUTATION_RATE: 0.05,
    MAX_MUTATION_RATE: 0.2
  },
  
  // Resource configuration
  RESOURCE: {
    DEFAULT_VALUE: 25,
    REGENERATION_RATE: 0.01,
    MAX_RESOURCES: 50
  }
};

/**
 * Generates a unique ID
 * @returns {string} A unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum boundary
 * @param {number} max - The maximum boundary
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deep clones an object
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep clone of the object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Maps a value from one range to another
 * @param {number} value - The value to map
 * @param {number} inMin - The minimum input range
 * @param {number} inMax - The maximum input range
 * @param {number} outMin - The minimum output range
 * @param {number} outMax - The maximum output range
 * @returns {number} The mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
