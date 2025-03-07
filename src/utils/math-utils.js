/**
 * @module math-utils
 * @description Mathematical utility functions used across domains
 * @global Should be accessible to all modules
 */

/**
 * Calculates the distance between two points
 * @param {Object} point1 - The first point with x and y coordinates
 * @param {Object} point2 - The second point with x and y coordinates
 * @returns {number} The distance between the two points
 */
export function distance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle between two points in radians
 * @param {Object} point1 - The first point with x and y coordinates
 * @param {Object} point2 - The second point with x and y coordinates
 * @returns {number} The angle in radians
 */
export function angle(point1, point2) {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

/**
 * Converts an angle from radians to degrees
 * @param {number} radians - The angle in radians
 * @returns {number} The angle in degrees
 */
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Converts an angle from degrees to radians
 * @param {number} degrees - The angle in degrees
 * @returns {number} The angle in radians
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random number between min and max
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer between min and max
 */
export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Normalizes a value to be between 0 and 1
 * @param {number} value - The value to normalize
 * @param {number} min - The minimum possible value
 * @param {number} max - The maximum possible value
 * @returns {number} The normalized value between 0 and 1
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Applies a Gaussian (normal) distribution to a random value
 * @param {number} mean - The mean of the distribution
 * @param {number} stdDev - The standard deviation of the distribution
 * @returns {number} A randomly generated number following a Gaussian distribution
 */
export function gaussian(mean, stdDev) {
  // Box-Muller transform
  const u1 = 1 - Math.random();
  const u2 = 1 - Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Linear interpolation between two values
 * @param {number} a - The first value
 * @param {number} b - The second value
 * @param {number} t - The interpolation factor (0-1)
 * @returns {number} The interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Calculates the midpoint between two points
 * @param {Object} point1 - The first point with x and y coordinates
 * @param {Object} point2 - The second point with x and y coordinates
 * @returns {Object} The midpoint with x and y coordinates
 */
export function midpoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
}

/**
 * Calculates the dot product of two vectors
 * @param {Object} v1 - The first vector with x and y components
 * @param {Object} v2 - The second vector with x and y components
 * @returns {number} The dot product
 */
export function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculates the cross product of two vectors (2D, returns scalar)
 * @param {Object} v1 - The first vector with x and y components
 * @param {Object} v2 - The second vector with x and y components
 * @returns {number} The cross product (scalar in 2D)
 */
export function crossProduct(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Normalizes a vector to unit length
 * @param {Object} vector - The vector to normalize with x and y components
 * @returns {Object} The normalized vector
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  
  // Prevent division by zero
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

/**
 * Calculates the magnitude (length) of a vector
 * @param {Object} vector - The vector with x and y components
 * @returns {number} The magnitude of the vector
 */
export function vectorMagnitude(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * Creates a vector from an angle and magnitude
 * @param {number} angle - The angle in radians
 * @param {number} magnitude - The magnitude (length) of the vector
 * @returns {Object} The vector with x and y components
 */
export function vectorFromAngle(angle, magnitude) {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  };
}

/**
 * Calculates the angle of a vector
 * @param {Object} vector - The vector with x and y components
 * @returns {number} The angle in radians
 */
export function vectorAngle(vector) {
  return Math.atan2(vector.y, vector.x);
}