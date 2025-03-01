/**
 * @module canvas-renderer
 * @description Handles rendering simulation elements to canvas
 * @domain UI
 * @private Should only be used by ui-manager.js
 */

import { CONSTANTS } from '../utils/core';
import { mapRange } from '../utils/math-utils';

// Internal canvas state
let canvas = null;
let context = null;

/**
 * Initializes the canvas renderer
 * @param {HTMLCanvasElement} canvasElement - The canvas element to use for rendering
 * @returns {boolean} Success status
 */
export function initializeRenderer(canvasElement) {
  if (!canvasElement) {
    console.error('Canvas element is required for initialization');
    return false;
  }
  
  try {
    canvas = canvasElement;
    context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    // Set initial canvas properties
    context.imageSmoothingEnabled = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize canvas renderer:', error);
    return false;
  }
}

/**
 * Clears the canvas with background color
 */
export function clearCanvas() {
  if (!context) return;
  
  context.fillStyle = CONSTANTS.CANVAS.BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Renders an organism on the canvas
 * @param {Object} organism - The organism to render
 */
export function renderOrganism(organism) {
  if (!context || !organism) return;
  
  const { position } = organism.state;
  const { bodySize, bodyShape } = organism.phenotype;
  
  // Calculate visual properties from phenotype
  const size = mapPhenotypeToSize(bodySize);
  const color = mapPhenotypeToColor(bodyShape);
  
  // Draw body
  context.fillStyle = color;
  context.beginPath();
  context.arc(position.x, position.y, size, 0, Math.PI * 2);
  context.fill();
  
  // Draw energy indicator (small bar above organism)
  const energyRatio = organism.state.energy / CONSTANTS.ORGANISM.REPRODUCTION_ENERGY_THRESHOLD;
  const energyBarWidth = size * 2;
  const energyBarHeight = 3;
  
  context.fillStyle = energyRatio > 0.7 ? 'green' : energyRatio > 0.3 ? 'yellow' : 'red';
  context.fillRect(
    position.x - size,
    position.y - size - 8,
    energyBarWidth * Math.min(1, energyRatio),
    energyBarHeight
  );
  
  // Draw appendages if any
  if (organism.phenotype.appendages && organism.phenotype.appendages.length > 0) {
    renderAppendages(organism);
  }
}

/**
 * Renders organism appendages
 * @param {Object} organism - The organism with appendages
 */
function renderAppendages(organism) {
  if (!context) return;
  
  const { position } = organism.state;
  const bodySize = mapPhenotypeToSize(organism.phenotype.bodySize);
  
  organism.phenotype.appendages.forEach(appendage => {
    // Position the appendage on the organism body
    const angleRadians = appendage.angle * Math.PI * 2;
    const attachX = position.x + Math.cos(angleRadians) * bodySize;
    const attachY = position.y + Math.sin(angleRadians) * bodySize;
    
    // Draw the appendage based on type
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    
    if (appendage.type === 'fin') {
      // Draw a fin-like structure
      const finLength = appendage.length * 15;
      const endX = attachX + Math.cos(angleRadians) * finLength;
      const endY = attachY + Math.sin(angleRadians) * finLength;
      
      context.beginPath();
      context.moveTo(attachX, attachY);
      context.lineTo(endX, endY);
      
      // Draw fin width
      const perpAngle = angleRadians + Math.PI / 2;
      const finWidth = appendage.length * 8;
      const finX1 = endX + Math.cos(perpAngle) * finWidth/2;
      const finY1 = endY + Math.sin(perpAngle) * finWidth/2;
      const finX2 = endX - Math.cos(perpAngle) * finWidth/2;
      const finY2 = endY - Math.sin(perpAngle) * finWidth/2;
      
      context.lineTo(finX1, finY1);
      context.lineTo(finX2, finY2);
      context.closePath();
      
      context.fillStyle = 'rgba(100, 150, 255, 0.7)';
      context.fill();
      context.stroke();
    } else if (appendage.type === 'flagella') {
      // Draw a flagella-like structure (wavy line)
      const flagellaLength = appendage.length * 25;
      const segments = 8;
      const segmentLength = flagellaLength / segments;
      const waveAmplitude = appendage.length * 5;
      
      context.beginPath();
      context.moveTo(attachX, attachY);
      
      let lastX = attachX;
      let lastY = attachY;
      
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const segX = attachX + Math.cos(angleRadians) * (t * flagellaLength);
        const segY = attachY + Math.sin(angleRadians) * (t * flagellaLength);
        
        // Add a perpendicular wave
        const perpAngle = angleRadians + Math.PI / 2;
        const waveOffset = Math.sin(t * Math.PI * 4) * waveAmplitude * (1 - t); // Amplitude decreases along length
        
        const pointX = segX + Math.cos(perpAngle) * waveOffset;
        const pointY = segY + Math.sin(perpAngle) * waveOffset;
        
        // Use quadratic curve for smoother appearance
        const controlX = (lastX + pointX) / 2;
        const controlY = (lastY + pointY) / 2;
        
        context.quadraticCurveTo(controlX, controlY, pointX, pointY);
        
        lastX = pointX;
        lastY = pointY;
      }
      
      context.stroke();
    }
  });
}

/**
 * Renders a resource on the canvas
 * @param {Object} resource - The resource to render
 */
export function renderResource(resource) {
  if (!context || !resource) return;
  
  const { position, value, type } = resource;
  
  // Different styling based on resource type
  if (type === 'food') {
    // Size based on value
    const size = Math.max(2, Math.min(6, value / 10));
    
    context.fillStyle = '#8BC34A'; // Green
    context.beginPath();
    context.arc(position.x, position.y, size, 0, Math.PI * 2);
    context.fill();
  } else if (type === 'poison') {
    // For future implementation
    const size = Math.max(2, Math.min(6, value / 10));
    
    context.fillStyle = '#E91E63'; // Pink/red
    context.beginPath();
    context.arc(position.x, position.y, size, 0, Math.PI * 2);
    context.fill();
  }
}

/**
 * Maps a phenotype body size value to visual size
 * @param {number} value - Normalized phenotype value (0-1)
 * @returns {number} Visual size in pixels
 */
function mapPhenotypeToSize(value) {
  return mapRange(
    value,
    0, 1,
    CONSTANTS.ORGANISM.MIN_SIZE,
    CONSTANTS.ORGANISM.MAX_SIZE
  );
}

/**
 * Maps a phenotype body shape value to a color
 * @param {number} value - Normalized phenotype value (0-1)
 * @returns {string} CSS color string
 */
function mapPhenotypeToColor(value) {
  // Map to hue value (0-360)
  const hue = value * 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Gets the current canvas dimensions
 * @returns {Object} Width and height of the canvas
 */
export function getCanvasDimensions() {
  if (!canvas) return { width: 0, height: 0 };
  
  return {
    width: canvas.width,
    height: canvas.height
  };
}

/**
 * Sets the canvas dimensions
 * @param {number} width - New width
 * @param {number} height - New height
 */
export function setCanvasDimensions(width, height) {
  if (!canvas) return;
  
  canvas.width = width;
  canvas.height = height;
  
  // Reset context properties after resize
  if (context) {
    context.imageSmoothingEnabled = true;
  }
}
