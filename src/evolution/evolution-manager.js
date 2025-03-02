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
let environmentalPressure = 0.5; // Default balanced environmental pressure (0-1)

/**
 * Initializes the evolution system
 * @returns {boolean} Success status
 */
export function initializeEvolutionSystem() {
  try {
    mutationRate = CONSTANTS.EVOLUTION.DEFAULT_MUTATION_RATE;
    generationCount = 0;
    environmentalPressure = 0.5;
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
 * Sets the environmental pressure factor
 * @param {number} pressure - Environmental pressure (0-1)
 * 0 = low selection pressure, 1 = high selection pressure
 */
export function setEnvironmentalPressure(pressure) {
  environmentalPressure = Math.max(0, Math.min(1, pressure));
}

/**
 * Gets the current environmental pressure
 * @returns {number} Current environmental pressure
 */
export function getEnvironmentalPressure() {
  return environmentalPressure;
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
  
  // Check if parent has enough energy
  if (parent.state.energy < CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD) {
    return null; // Not enough energy to reproduce
  }
  
  // Create offspring genome with mutations
  const offspringGenome = mutateGenome(parent.genome);
  
  // Calculate energy transfer based on parent's energy and energy transfer ratio
  const energyTransfer = parent.state.energy * CONSTANTS.ORGANISM.ENERGY_TRANSFER_RATIO;
  
  // Reduce parent's energy
  const updatedParentEnergy = parent.state.energy * (1 - CONSTANTS.ORGANISM.ENERGY_TRANSFER_RATIO);
  
  // Position offset with some randomness to prevent stacking
  const positionOffset = 20; // Base offset for visibility
  const randomOffset = () => (Math.random() * 20 - 10); // Random -10 to +10
  
  // Create offspring at slightly offset position
  const offspring = createOrganism({
    genome: offspringGenome,
    state: {
      position: {
        x: parent.state.position.x + positionOffset * Math.cos(Math.random() * Math.PI * 2) + randomOffset(),
        y: parent.state.position.y + positionOffset * Math.sin(Math.random() * Math.PI * 2) + randomOffset()
      },
      // Initial velocity based on parent but with variation
      velocity: {
        x: parent.state.velocity.x * 0.8 + randomOffset() * 0.2,
        y: parent.state.velocity.y * 0.8 + randomOffset() * 0.2
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
  
  // Determine if this is a rare "jump mutation" (large change)
  const isJumpMutation = Math.random() < 0.05 * mutationRate;
  
  // Mutate basic properties
  Object.keys(mutatedGenome).forEach(key => {
    if (key !== 'appendages' && typeof mutatedGenome[key] === 'object' && mutatedGenome[key].value !== undefined) {
      // Apply mutation based on the gene's mutation rate and global mutation rate
      if (Math.random() < mutatedGenome[key].mutationRate * mutationRate) {
        // Use gaussian distribution for more realistic mutations
        // If jump mutation, make a larger change
        const mutationMagnitude = isJumpMutation ? 0.3 : 0.1;
        mutatedGenome[key].value = Math.max(0, Math.min(1,
          mutatedGenome[key].value + gaussian(0, mutationMagnitude)
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
            // If jump mutation, make a larger change
            const mutationMagnitude = isJumpMutation ? 0.25 : 0.1;
            appendage[key].value = Math.max(0, Math.min(1,
              appendage[key].value + gaussian(0, mutationMagnitude)
            ));
          }
        }
      });
      
      // Small chance to change appendage type with increased chance during jump mutations
      if (Math.random() < mutationRate * (isJumpMutation ? 0.3 : 0.1)) {
        appendage.type = appendage.type === 'fin' ? 'flagella' : 'fin';
      }
      
      // Chance to develop specialized appendage features (placeholder for future expansion)
      if (isJumpMutation && Math.random() < mutationRate * 0.2) {
        // This could be expanded in the future to add new appendage properties
        // For now, just adjust existing properties more significantly
        if (appendage.length) {
          appendage.length.value = Math.max(0, Math.min(1, appendage.length.value + gaussian(0, 0.4)));
        }
      }
    });
  }
  
  // Chance to add a new appendage, increased during jump mutations
  const appendageAddChance = isJumpMutation ? 0.4 : 0.2;
  if (mutatedGenome.appendages.length < 3 && Math.random() < mutationRate * appendageAddChance) {
    const appendageType = Math.random() > 0.5 ? "fin" : "flagella";
    
    mutatedGenome.appendages.push({
      type: appendageType,
      length: { value: random(0.3, 0.8), mutationRate: 0.05 },
      position: { value: random(0, 1), mutationRate: 0.02 },
      angle: { value: random(0, 1), mutationRate: 0.04 }
    });
  }
  
  // Chance to remove an appendage, slightly increased during jump mutations
  const appendageRemoveChance = isJumpMutation ? 0.15 : 0.1;
  if (mutatedGenome.appendages.length > 0 && Math.random() < mutationRate * appendageRemoveChance) {
    const index = Math.floor(Math.random() * mutatedGenome.appendages.length);
    mutatedGenome.appendages.splice(index, 1);
  }
  
  return mutatedGenome;
}

/**
 * Applies selection pressure based on organism fitness and environmental factors
 * @param {Array} organisms - Array of organism objects
 * @param {Object} environment - The current environment state
 */
export function applySelection(organisms, environment) {
  // If no organisms provided, get all organisms
  const allOrganisms = organisms || [];
  
  // If environment is provided, use it to influence selection
  const hasEnvironment = environment && typeof environment === 'object';
  
  allOrganisms.forEach(organism => {
    // Calculate fitness considering environmental factors if available
    const fitness = calculateOrganismFitness(organism, hasEnvironment ? environment : null);
    
    // Base reproduction chance on fitness and environmental pressure
    const reproductionThreshold = CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD;
    const hasEnoughEnergy = organism.state && organism.state.energy >= reproductionThreshold;
    
    // Only attempt reproduction if organism has enough energy
    if (hasEnoughEnergy) {
      // Energy is sufficient - can reproduce
      reproduceOrganism(organism.id);
    }
    
    // Future expansion: environmental adaptation could influence survival beyond reproduction
  });
}

/**
 * Calculates fitness for a given organism, considering environmental factors
 * @param {Object} organism - The organism to evaluate
 * @param {Object} environment - Optional environment data to consider
 * @returns {number} Fitness score
 */
export function calculateOrganismFitness(organism, environment = null) {
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
  
  // Appendage efficiency: more appendages can be beneficial or detrimental depending on environment
  const appendageScore = calculateAppendageEfficiency(organism);
  
  // Environmental adaptation: how well the organism fits the environment
  const environmentScore = environment ? calculateEnvironmentFit(organism, environment) : 0.5;
  
  // Weighted sum of different fitness components
  // Adjust weights based on environmental pressure
  const fitnessScore = (
    energyScore * 0.35 +
    metabolismScore * 0.15 +
    sensorScore * 0.1 +
    movementScore * 0.15 +
    ageScore * 0.1 +
    appendageScore * 0.05 +
    environmentScore * 0.1
  );
  
  return fitnessScore;
}

/**
 * Calculates how efficient the organism's appendages are
 * @param {Object} organism - The organism to evaluate
 * @returns {number} Efficiency score (0-1)
 */
function calculateAppendageEfficiency(organism) {
  if (!organism.phenotype || !organism.phenotype.appendages) {
    return 0.5; // Neutral score if no appendages data
  }
  
  const appendages = organism.phenotype.appendages;
  
  // If no appendages, provide a neutral score
  if (appendages.length === 0) {
    return 0.5;
  }
  
  // Calculate average efficiency of appendages
  let totalEfficiency = 0;
  
  appendages.forEach(app => {
    let efficiency = 0;
    
    // Different calculations based on appendage type
    if (app.type === 'fin') {
      // Fins are more efficient for faster movement
      efficiency = 0.5 + (app.length * 0.5) * (organism.phenotype.speed * 0.5);
    } else if (app.type === 'flagella') {
      // Flagella are more efficient for precise movements
      efficiency = 0.7 + (app.length * 0.3) * (organism.phenotype.turnRate * 0.5);
    }
    
    totalEfficiency += efficiency;
  });
  
  // Calculate average but with diminishing returns for many appendages
  // 1-2 appendages can be optimal, 3+ may add drag
  const averageEfficiency = totalEfficiency / appendages.length;
  const diminishingFactor = Math.max(0, 1 - (Math.max(0, appendages.length - 2) * 0.2));
  
  return averageEfficiency * diminishingFactor;
}

/**
 * Calculates how well an organism fits the current environment
 * @param {Object} organism - The organism to evaluate
 * @param {Object} environment - The environment data
 * @returns {number} Environmental fit score (0-1)
 */
function calculateEnvironmentFit(organism, environment) {
  // This is a placeholder that can be expanded with actual environmental factors
  // For now, return a simplified calculation
  
  // Default to neutral adaptation
  let environmentFit = 0.5;
  
  // If we have environment data, we can make this more sophisticated
  if (environment) {
    // Example: resource density could favor different strategies
    const resourceDensity = environment.resources ? 
      Math.min(1, environment.resources.length / environment.parameters.maxResources) : 
      0.5;
    
    // High resource density favors fast movement and metabolism
    // Low resource density favors efficiency and sensors
    if (resourceDensity > 0.7) {
      // Resource-rich environment: speed and higher metabolism is good
      environmentFit = 0.3 + (organism.phenotype.speed * 0.4) + (organism.phenotype.metabolism * 0.3);
    } else if (resourceDensity < 0.3) {
      // Resource-poor environment: efficiency and sensors are good
      environmentFit = 0.3 + ((1 - organism.phenotype.metabolism) * 0.4) + (organism.phenotype.sensorRange * 0.3);
    } else {
      // Balanced environment: balanced traits are good
      const balanceFactor = 1 - Math.abs(organism.phenotype.speed - (1 - organism.phenotype.metabolism));
      environmentFit = 0.4 + (balanceFactor * 0.6);
    }
  }
  
  return Math.max(0, Math.min(1, environmentFit));
}