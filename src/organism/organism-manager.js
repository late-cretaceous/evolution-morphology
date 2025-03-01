/**
 * @module organism-manager
 * @description Domain manager for the Organism domain
 * @domain Organism
 * @responsibility Manages organism lifecycle, morphology and behaviors
 */

import { CONSTANTS, generateId, deepClone, mapRange } from '../utils/core';
import { distance, angle, random, gaussian } from '../utils/math-utils';

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
  const defaultGenome = generateDefaultGenome();
  
  // Allow genome override
  const genome = properties.genome || defaultGenome;
  
  // Generate phenotype from genome
  const phenotype = generatePhenotype(genome);
  
  const defaultOrganism = {
    id: generateId(),
    genome: genome,
    phenotype: phenotype,
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
    // Create random genome variations
    const genome = generateRandomGenome();
    
    // Create organism with random position within environment bounds
    const organism = createOrganism({
      genome: genome,
      state: {
        position: {
          x: Math.random() * environmentBounds.width,
          y: Math.random() * environmentBounds.height
        },
        // Initial random velocity for movement
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
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
  organisms.forEach(organism => {
    // Increase age
    organism.state.age += deltaTime;
    
    // Decrease energy over time (metabolism)
    decreaseEnergy(organism, deltaTime);
    
    // Move organism
    moveOrganism(organism, deltaTime, environment);
    
    // Find resources
    findAndConsumeResources(organism, environment);
    
    // Check if organism has died
    if (organism.state.energy <= 0) {
      // Mark for removal
      organism.state.dead = true;
    }
  });
  
  // Remove dead organisms
  organisms = organisms.filter(o => !o.state.dead);
}

/**
 * Decreases organism energy based on metabolism and activity
 * @param {Object} organism - The organism to update
 * @param {number} deltaTime - Time elapsed since last update
 */
function decreaseEnergy(organism, deltaTime) {
  // Base energy consumption based on metabolism
  const baseConsumption = organism.phenotype.metabolism * CONSTANTS.ORGANISM.MOVEMENT_ENERGY_COST * deltaTime;
  
  // Additional consumption based on movement
  const speed = Math.sqrt(organism.state.velocity.x ** 2 + organism.state.velocity.y ** 2);
  const movementConsumption = speed * CONSTANTS.ORGANISM.MOVEMENT_ENERGY_COST * deltaTime;
  
  // Size-based consumption (larger organisms use more energy)
  const sizeConsumption = organism.phenotype.bodySize * 0.01 * deltaTime;
  
  // Update energy
  organism.state.energy -= (baseConsumption + movementConsumption + sizeConsumption);
  
  // Ensure energy doesn't go below 0
  organism.state.energy = Math.max(0, organism.state.energy);
}

/**
 * Moves an organism based on its properties and environment
 * @param {Object} organism - The organism to move
 * @param {number} deltaTime - Time elapsed since last update
 * @param {Object} environment - Current environment state
 */
function moveOrganism(organism, deltaTime, environment) {
  // Calculate movement properties based on phenotype
  const maxSpeed = organism.phenotype.speed * 50; // Max speed in pixels per second
  const turnRate = organism.phenotype.turnRate * 2; // Turn rate in radians per second
  
  // Check if there are nearby resources to move towards
  const nearestResource = findNearestResource(organism, environment);
  
  if (nearestResource) {
    // Move towards resource
    moveTowardsTarget(organism, nearestResource.position, maxSpeed, turnRate, deltaTime);
  } else {
    // Random movement if no resources nearby
    randomMovement(organism, maxSpeed, turnRate, deltaTime);
  }
  
  // Update position based on velocity
  organism.state.position.x += organism.state.velocity.x * deltaTime;
  organism.state.position.y += organism.state.velocity.y * deltaTime;
  
  // Keep organism within environment boundaries
  constrainToEnvironment(organism, environment);
}

/**
 * Finds the nearest resource to an organism
 * @param {Object} organism - The organism
 * @param {Object} environment - Current environment state
 * @returns {Object|null} The nearest resource or null if none found
 */
function findNearestResource(organism, environment) {
  if (!environment.resources || environment.resources.length === 0) {
    return null;
  }
  
  const sensorRange = organism.phenotype.sensorRange * 200; // Convert to pixels
  let nearestResource = null;
  let nearestDistance = Infinity;
  
  environment.resources.forEach(resource => {
    const dist = distance(organism.state.position, resource.position);
    if (dist < sensorRange && dist < nearestDistance) {
      nearestDistance = dist;
      nearestResource = resource;
    }
  });
  
  return nearestResource;
}

/**
 * Moves an organism towards a target position
 * @param {Object} organism - The organism to move
 * @param {Object} targetPosition - The target position {x, y}
 * @param {number} maxSpeed - Maximum speed in pixels per second
 * @param {number} turnRate - Turn rate in radians per second
 * @param {number} deltaTime - Time elapsed since last update
 */
function moveTowardsTarget(organism, targetPosition, maxSpeed, turnRate, deltaTime) {
  // Calculate angle to target
  const targetAngle = Math.atan2(
    targetPosition.y - organism.state.position.y,
    targetPosition.x - organism.state.position.x
  );
  
  // Current movement angle
  const currentAngle = Math.atan2(organism.state.velocity.y, organism.state.velocity.x);
  
  // Calculate the difference between angles
  let angleDiff = targetAngle - currentAngle;
  
  // Normalize to [-PI, PI]
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  
  // Calculate new angle based on turn rate
  const maxTurn = turnRate * deltaTime;
  const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
  
  // Calculate new velocity based on max speed
  const speed = maxSpeed;
  organism.state.velocity.x = Math.cos(newAngle) * speed;
  organism.state.velocity.y = Math.sin(newAngle) * speed;
}

/**
 * Applies random movement to an organism
 * @param {Object} organism - The organism to move
 * @param {number} maxSpeed - Maximum speed in pixels per second
 * @param {number} turnRate - Turn rate in radians per second
 * @param {number} deltaTime - Time elapsed since last update
 */
function randomMovement(organism, maxSpeed, turnRate, deltaTime) {
  // Current movement angle
  const currentAngle = Math.atan2(organism.state.velocity.y, organism.state.velocity.x);
  
  // Random angle change
  const randomTurn = (Math.random() - 0.5) * turnRate * deltaTime;
  const newAngle = currentAngle + randomTurn;
  
  // Random speed variation (80-100% of max speed)
  const speedVariation = 0.8 + Math.random() * 0.2;
  const speed = maxSpeed * speedVariation;
  
  // Update velocity
  organism.state.velocity.x = Math.cos(newAngle) * speed;
  organism.state.velocity.y = Math.sin(newAngle) * speed;
}

/**
 * Constrains an organism to stay within environment boundaries
 * @param {Object} organism - The organism to constrain
 * @param {Object} environment - Current environment state
 */
function constrainToEnvironment(organism, environment) {
  const { width, height } = environment.boundaries;
  const radius = mapPhenotypeToSize(organism.phenotype.bodySize);
  
  // Constrain x position
  if (organism.state.position.x < radius) {
    organism.state.position.x = radius;
    organism.state.velocity.x = Math.abs(organism.state.velocity.x);
  } else if (organism.state.position.x > width - radius) {
    organism.state.position.x = width - radius;
    organism.state.velocity.x = -Math.abs(organism.state.velocity.x);
  }
  
  // Constrain y position
  if (organism.state.position.y < radius) {
    organism.state.position.y = radius;
    organism.state.velocity.y = Math.abs(organism.state.velocity.y);
  } else if (organism.state.position.y > height - radius) {
    organism.state.position.y = height - radius;
    organism.state.velocity.y = -Math.abs(organism.state.velocity.y);
  }
}

/**
 * Finds and consumes nearby resources
 * @param {Object} organism - The organism
 * @param {Object} environment - Current environment state
 */
function findAndConsumeResources(organism, environment) {
  if (!environment.resources || environment.resources.length === 0) {
    return;
  }
  
  const consumptionRadius = mapPhenotypeToSize(organism.phenotype.bodySize);
  
  // Find resources within consumption radius
  for (let i = environment.resources.length - 1; i >= 0; i--) {
    const resource = environment.resources[i];
    const dist = distance(organism.state.position, resource.position);
    
    if (dist < consumptionRadius) {
      // Consume the resource
      organism.state.energy += resource.value;
      
      // Remove the resource from the environment
      environment.resources.splice(i, 1);
    }
  }
}

/**
 * Generates a random genome with variations
 * @returns {Object} A randomly generated genome
 */
function generateRandomGenome() {
  const genome = {
    // Basic properties
    bodySize: { value: random(0.3, 0.7), mutationRate: 0.03 },
    bodyShape: { value: random(0.3, 0.7), mutationRate: 0.02 },
    metabolism: { value: random(0.3, 0.7), mutationRate: 0.03 },
    sensorRange: { value: random(0.3, 0.7), mutationRate: 0.02 },
    
    // Movement properties
    speed: { value: random(0.3, 0.7), mutationRate: 0.04 },
    turnRate: { value: random(0.3, 0.7), mutationRate: 0.03 },
    
    // Appendages
    appendages: []
  };
  
  // Random number of appendages (0-3)
  const appendageCount = Math.floor(random(0, 3.99));
  
  // Add random appendages
  for (let i = 0; i < appendageCount; i++) {
    const appendageType = Math.random() > 0.5 ? "fin" : "flagella";
    
    genome.appendages.push({
      type: appendageType,
      length: { value: random(0.3, 0.8), mutationRate: 0.05 },
      position: { value: random(0, 1), mutationRate: 0.02 },
      angle: { value: random(0, 1), mutationRate: 0.04 }
    });
  }
  
  return genome;
}

/**
 * Generates a default genome for a new organism
 * @returns {Object} Default genome
 */
function generateDefaultGenome() {
  return {
    // Basic properties
    bodySize: { value: 0.5, mutationRate: 0.03 },
    bodyShape: { value: 0.5, mutationRate: 0.02 },
    metabolism: { value: 0.5, mutationRate: 0.03 },
    sensorRange: { value: 0.5, mutationRate: 0.02 },
    
    // Movement properties
    speed: { value: 0.5, mutationRate: 0.04 },
    turnRate: { value: 0.5, mutationRate: 0.03 },
    
    // Appendages
    appendages: [
      {
        type: "fin", // fin, flagella
        length: { value: 0.5, mutationRate: 0.05 },
        position: { value: 0.5, mutationRate: 0.02 }, // position along body
        angle: { value: 0.5, mutationRate: 0.04 }
      }
    ]
  };
}

/**
 * Generates a phenotype from a genome
 * @param {Object} genome - The organism's genome
 * @returns {Object} The generated phenotype
 */
function generatePhenotype(genome) {
  const phenotype = {
    // Map basic properties directly
    bodySize: genome.bodySize.value,
    bodyShape: genome.bodyShape.value,
    metabolism: genome.metabolism.value,
    sensorRange: genome.sensorRange.value,
    
    // Map movement properties
    speed: genome.speed.value,
    turnRate: genome.turnRate.value,
    
    // Map appendages
    appendages: []
  };
  
  // Process appendages
  if (genome.appendages && genome.appendages.length > 0) {
    phenotype.appendages = genome.appendages.map(app => ({
      type: app.type,
      length: app.length.value,
      position: app.position.value,
      angle: app.angle.value
    }));
  }
  
  return phenotype;
}

/**
 * Maps phenotype body size value to visual size
 * @param {number} value - Normalized phenotype value (0-1)
 * @returns {number} Visual size in pixels
 */
function mapPhenotypeToSize(value) {
  return CONSTANTS.ORGANISM.MIN_SIZE + 
    value * (CONSTANTS.ORGANISM.MAX_SIZE - CONSTANTS.ORGANISM.MIN_SIZE);
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