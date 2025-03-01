/**
 * @module evolution-manager
 * @description Domain manager for the Evolution domain
 * @domain Evolution
 * @responsibility Manages evolution processes, mutation, selection and reproduction
 */

import { CONSTANTS, generateId, deepClone } from '../utils/core';
import { random, gaussian } from '../utils/math-utils';
import { createOrganism, getOrganismById, removeOrganism } from '../organism/organism-manager';

// Internal state
let mutationRate = CONSTANTS.EVOLUTION.DEFAULT_MUTATION_RATE;
let generationCount = 0;

/**
 * Initializes the evolution system
 * @returns {boolean} Success status
 */
export function initializeEvolutionSystem() {
  try {
    mutationRate = CONSTANTS.EVOLUTION.DEFAULT_MUTATION_RATE;
    generationCount = 0;
    console.log('Evolution system initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize evolution system:', error);
    return false;
  }
}

/**
 * Sets the global mutation rate
 * @param {number} rate - New mutation rate (0-1)
 */
export function setMutationRate(rate) {
  mutationRate = Math.max(0, Math.min(CONSTANTS.EVOLUTION.MAX_MUTATION_RATE, rate));
}

/**
 * Gets the current mutation rate
 * @returns {number} Current mutation rate
 */
export function getMutationRate() {
  return mutationRate;
}

/**
 * Gets the current generation count
 * @returns {number} Current generation count
 */
export function getGenerationCount() {
  return generationCount;
}

/**
 * Processes reproduction for an organism that has enough energy
 * @param {string} parentId - ID of the parent organism
 * @returns {string|null} ID of the new organism, or null if reproduction failed
 */
export function reproduceOrganism(parentId) {
  const parent = getOrganismById(parentId);
  
  if (!parent) {
    console.error(`Cannot reproduce: parent ${parentId} not found`);
    return null;
  }
  
  if (parent.state.energy < CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD) {
    return null; // Not enough energy to reproduce
  }
  
  // Create offspring genome with mutations
  const offspringGenome = mutateGenome(parent.genome);
  
  // Calculate energy transfer
  const energyTransfer = parent.state.energy * CONSTANTS.ORGANISM.ENERGY_TRANSFER_RATIO;
  
  // Reduce parent's energy
  const updatedParentEnergy = parent.state.energy * (1 - CONSTANTS.ORGANISM.ENERGY_TRANSFER_RATIO);
  
  // Create offspring at slightly offset position
  const offspring = createOrganism({
    genome: offspringGenome,
    state: {
      position: {
        x: parent.state.position.x + (Math.random() * 20 - 10),
        y: parent.state.position.y + (Math.random() * 20 - 10)
      },
      energy: energyTransfer
    }
  });
  
  // Update parent energy by creating a new organism with updated energy
  const updatedParent = createOrganism({
    ...parent,
    state: {
      ...parent.state,
      energy: updatedParentEnergy
    }
  });
  
  // Remove the original parent
  removeOrganism(parentId);
  
  // Increment generation count when reproduction occurs
  generationCount++;
  
  return offspring.id;
}

/**
 * Creates a mutated copy of a genome
 * @param {Object} genome - The original genome
 * @returns {Object} A mutated copy of the genome
 */
function mutateGenome(genome) {
  // Create a deep clone of the genome to avoid modifying the original
  const mutatedGenome = deepClone(genome);
  
  // Mutate basic properties
  Object.keys(mutatedGenome).forEach(key => {
    if (key !== 'appendages' && typeof mutatedGenome[key] === 'object' && mutatedGenome[key].value !== undefined) {
      // Apply mutation based on the gene's mutation rate and global mutation rate
      if (Math.random() < mutatedGenome[key].mutationRate * mutationRate) {
        // Use gaussian distribution for more realistic mutations
        mutatedGenome[key].value = Math.max(0, Math.min(1,
          mutatedGenome[key].value + gaussian(0, 0.1)
        ));
      }
    }
  });
  
  // Mutate appendages
  if (mutatedGenome.appendages && mutatedGenome.appendages.length > 0) {
    // Loop through each appendage and mutate its properties
    mutatedGenome.appendages.forEach(appendage => {
      Object.keys(appendage).forEach(key => {
        if (key !== 'type' && typeof appendage[key] === 'object' && appendage[key].value !== undefined) {
          // Apply mutation based on the gene's mutation rate and global mutation rate
          if (Math.random() < appendage[key].mutationRate * mutationRate) {
            // Use gaussian distribution for more realistic mutations
            appendage[key].value = Math.max(0, Math.min(1,
              appendage[key].value + gaussian(0, 0.1)
            ));
          }
        }
      });
      
      // Small chance to change appendage type
      if (Math.random() < mutationRate * 0.1) {
        appendage.type = appendage.type === 'fin' ? 'flagella' : 'fin';
      }
    });
  }
  
  // Chance to add a new appendage
  if (mutatedGenome.appendages.length < 3 && Math.random() < mutationRate * 0.2) {
    const appendageType = Math.random() > 0.5 ? "fin" : "flagella";
    
    mutatedGenome.appendages.push({
      type: appendageType,
      length: { value: random(0.3, 0.8), mutationRate: 0.05 },
      position: { value: random(0, 1), mutationRate: 0.02 },
      angle: { value: random(0, 1), mutationRate: 0.04 }
    });
  }
  
  // Chance to remove an appendage
  if (mutatedGenome.appendages.length > 0 && Math.random() < mutationRate * 0.1) {
    const index = Math.floor(Math.random() * mutatedGenome.appendages.length);
    mutatedGenome.appendages.splice(index, 1);
  }
  
  return mutatedGenome;
}

/**
 * Applies selection pressure based on organism fitness
 * @param {Array} organisms - Array of organism IDs
 * @param {Function} fitnessFunction - Function to calculate fitness
 */
export function applySelection(organisms, fitnessFunction) {
  // For the Organism Phase, we'll automatically reproduce organisms
  // that have enough energy
  const allOrganisms = organisms || [];
  
  allOrganisms.forEach(organism => {
    // Check if organism has enough energy to reproduce
    if (organism.state && organism.state.energy >= CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD) {
      reproduceOrganism(organism.id);
    }
  });
}

/**
 * Calculates fitness for a given organism
 * @param {Object} organism - The organism to evaluate
 * @returns {number} Fitness score
 */
export function calculateOrganismFitness(organism) {
  if (!organism) return 0;
  
  // Calculate a weighted fitness score based on various factors
  
  // Energy efficiency: how efficiently the organism gathers energy
  const energyScore = organism.state.energy / CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD;
  
  // Metabolic efficiency: lower metabolism means less energy consumption
  const metabolismScore = 1 - organism.phenotype.metabolism;
  
  // Sensory capability: better sensors help find resources
  const sensorScore = organism.phenotype.sensorRange;
  
  // Movement efficiency: balance between speed and energy cost
  const movementScore = organism.phenotype.speed * (1 - organism.phenotype.metabolism);
  
  // Age bonus: surviving longer is a sign of fitness
  const ageScore = Math.min(1, organism.state.age / 100);
  
  // Weighted sum of different fitness components
  const fitnessScore = (
    energyScore * 0.4 +
    metabolismScore * 0.2 +
    sensorScore * 0.1 +
    movementScore * 0.2 +
    ageScore * 0.1
  );
  
  return fitnessScore;
}