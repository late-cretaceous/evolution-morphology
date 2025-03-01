/**
 * @module evolution-manager
 * @description Domain manager for the Evolution domain
 * @domain Evolution
 * @responsibility Manages evolution processes, mutation, selection and reproduction
 */

import { CONSTANTS, generateId } from '../utils/core';
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
  
  // Update parent energy
  // This would normally be handled by organism-manager in a real implementation
  // For the Foundation Phase, this is just a placeholder
  console.log(`Organism ${parentId} reproduced, creating organism ${offspring.id}`);
  
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
  // This is a simplified placeholder for the Foundation Phase
  // More complex mutation logic will be implemented in the Evolution Phase
  
  const mutatedGenome = { ...genome };
  
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
  
  return mutatedGenome;
}

/**
 * Applies selection pressure based on organism fitness
 * @param {Array} organisms - Array of organism IDs
 * @param {Function} fitnessFunction - Function to calculate fitness
 */
export function applySelection(organisms, fitnessFunction) {
  // This will be implemented in the Evolution Phase
  // For now, just a placeholder
  console.log(`Applying selection to ${organisms.length} organisms`);
}
