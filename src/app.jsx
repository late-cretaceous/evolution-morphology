/**
 * @module app
 * @description High-level coordinator for the Evolution Morphology Simulator
 * @coordinator Manages flow between major application domains
 */

import React, { useEffect, useState } from 'react';
import { CONSTANTS } from './utils/core';

// Import domain managers
import { initializeOrganismSystem } from './organism/organism-manager';
import { initializeEvolutionSystem, setMutationRate } from './evolution/evolution-manager';
import { 
  initializeSimulation, 
  startSimulation, 
  stopSimulation, 
  resetSimulation,
  setEnvironmentBoundaries
} from './simulation/simulation-manager';
import { initializeUI, renderSimulation, setCanvasDimensions } from './ui/ui-manager';
import { initializeDataTracking, getStatistics } from './data/data-manager';

function App() {
  const [simulationState, setSimulationState] = useState({
    isInitialized: false,
    isRunning: false,
    simulationSpeed: CONSTANTS.SIMULATION.DEFAULT_SPEED,
    populationSize: CONSTANTS.SIMULATION.DEFAULT_POPULATION_SIZE,
    mutationRate: CONSTANTS.EVOLUTION.DEFAULT_MUTATION_RATE,
    statistics: null,
    selectedOrganism: null
  });

  /**
   * Initialize all systems when the application starts
   */
  useEffect(() => {
    if (!simulationState.isInitialized) {
      initializeApplication();
    }
  }, [simulationState.isInitialized]);

  /**
   * Initializes all domain systems
   */
  const initializeApplication = () => {
    try {
      // Initialize each domain through its manager
      initializeOrganismSystem();
      initializeEvolutionSystem();
      initializeDataTracking();
      
      // Set up environment dimensions
      const canvasContainer = document.getElementById('simulation-container');
      let canvasWidth = CONSTANTS.CANVAS.DEFAULT_WIDTH;
      let canvasHeight = CONSTANTS.CANVAS.DEFAULT_HEIGHT;
      
      if (canvasContainer) {
        canvasWidth = canvasContainer.clientWidth;
        canvasHeight = Math.min(window.innerHeight * 0.6, canvasContainer.clientWidth * 0.75);
      }
      
      // Set environment boundaries to match canvas
      setEnvironmentBoundaries(canvasWidth, canvasHeight);
      
      // Initialize UI after other systems
      initializeUI({
        onStart: handleStartSimulation,
        onStop: handleStopSimulation,
        onReset: handleResetSimulation,
        onSpeedChange: handleSpeedChange,
        onPopulationSizeChange: handlePopulationSizeChange,
        onMutationRateChange: handleMutationRateChange,
        onOrganismSelect: handleOrganismSelect
      });
      
      // Set canvas dimensions
      setCanvasDimensions(canvasWidth, canvasHeight);
      
      // Initialize simulation last, as it depends on the other systems
      initializeSimulation();

      setSimulationState(prevState => ({
        ...prevState,
        isInitialized: true,
        statistics: getStatistics()
      }));

      console.log('Evolution Morphology Simulator initialized successfully');
      
      // Handle window resize
      window.addEventListener('resize', handleWindowResize);
      
      // Clean up event listener on unmount
      return () => {
        window.removeEventListener('resize', handleWindowResize);
      };
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  };

  /**
   * Handles window resize events
   */
  const handleWindowResize = () => {
    const canvasContainer = document.getElementById('simulation-container');
    
    if (canvasContainer) {
      const canvasWidth = canvasContainer.clientWidth;
      const canvasHeight = Math.min(window.innerHeight * 0.6, canvasContainer.clientWidth * 0.75);
      
      // Update canvas dimensions
      setCanvasDimensions(canvasWidth, canvasHeight);
      
      // Update environment boundaries
      setEnvironmentBoundaries(canvasWidth, canvasHeight);
    }
  };

  /**
   * Starts the simulation
   */
  const handleStartSimulation = () => {
    if (!simulationState.isRunning) {
      startSimulation(simulationState.simulationSpeed);
      setSimulationState(prevState => ({
        ...prevState,
        isRunning: true
      }));
    }
  };

  /**
   * Stops the simulation
   */
  const handleStopSimulation = () => {
    if (simulationState.isRunning) {
      stopSimulation();
      setSimulationState(prevState => ({
        ...prevState,
        isRunning: false
      }));
    }
  };

  /**
   * Resets the simulation to initial state
   */
  const handleResetSimulation = () => {
    handleStopSimulation();
    resetSimulation();
    setSimulationState(prevState => ({
      ...prevState,
      statistics: getStatistics(),
      selectedOrganism: null
    }));
  };

  /**
   * Updates the simulation speed
   * @param {number} speed - The new simulation speed
   */
  const handleSpeedChange = (speed) => {
    const clampedSpeed = Math.max(
      CONSTANTS.SIMULATION.MIN_SPEED,
      Math.min(CONSTANTS.SIMULATION.MAX_SPEED, speed)
    );
    
    setSimulationState(prevState => ({
      ...prevState,
      simulationSpeed: clampedSpeed
    }));
    
    if (simulationState.isRunning) {
      startSimulation(clampedSpeed); // Restart with new speed
    }
  };

  /**
   * Updates the population size for resets
   * @param {number} size - The new population size
   */
  const handlePopulationSizeChange = (size) => {
    const clampedSize = Math.max(1, Math.min(200, size));
    
    setSimulationState(prevState => ({
      ...prevState,
      populationSize: clampedSize
    }));
    
    // Population size is applied on reset
  };

  /**
   * Updates the mutation rate
   * @param {number} rate - The new mutation rate
   */
  const handleMutationRateChange = (rate) => {
    const clampedRate = Math.max(0, Math.min(CONSTANTS.EVOLUTION.MAX_MUTATION_RATE, rate));
    
    setSimulationState(prevState => ({
      ...prevState,
      mutationRate: clampedRate
    }));
    
    // Update the evolution system
    setMutationRate(clampedRate);
  };

  /**
   * Handles organism selection for details view
   * @param {Object} organism - The selected organism
   */
  const handleOrganismSelect = (organism) => {
    setSimulationState(prevState => ({
      ...prevState,
      selectedOrganism: organism
    }));
  };

  /**
   * Closes the organism detail panel
   */
  const handleCloseOrganismDetails = () => {
    setSimulationState(prevState => ({
      ...prevState,
      selectedOrganism: null
    }));
  };

  /**
   * Updates simulation statistics periodically
   */
  useEffect(() => {
    if (simulationState.isRunning) {
      const statisticsInterval = setInterval(() => {
        setSimulationState(prevState => ({
          ...prevState,
          statistics: getStatistics()
        }));
      }, 1000); // Update statistics every second

      return () => clearInterval(statisticsInterval);
    }
  }, [simulationState.isRunning]);

  return (
    <div className="evolution-simulator">
      <header className="app-header">
        <h1 className="app-title">Evolution Morphology Simulator</h1>
        <p className="app-subtitle">Observe and experiment with digital organisms evolving over time</p>
      </header>
      
      <div className="app-content">
        <div className="simulation-view">
          <div id="simulation-container">
            {/* Canvas will be rendered here by the UI manager */}
          </div>
        </div>
        
        <div className="simulation-controls">
          <div id="control-panel">
            {/* Controls will be rendered here by the UI manager */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;