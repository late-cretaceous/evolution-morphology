/**
 * @module app
 * @description High-level coordinator for the Evolution Morphology Simulator
 * @coordinator Manages flow between major application domains
 */

import React, { useEffect, useState } from 'react';
import { CONSTANTS } from './utils/core';

// Import domain managers
import { initializeOrganismSystem } from './organism/organism-manager';
import { initializeEvolutionSystem } from './evolution/evolution-manager';
import { initializeSimulation, startSimulation, stopSimulation, resetSimulation } from './simulation/simulation-manager';
import { initializeUI, renderSimulation } from './ui/ui-manager';
import { initializeDataTracking, getStatistics } from './data/data-manager';

function App() {
  const [simulationState, setSimulationState] = useState({
    isInitialized: false,
    isRunning: false,
    simulationSpeed: CONSTANTS.SIMULATION.DEFAULT_SPEED,
    statistics: null
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
      
      // Initialize UI after other systems
      initializeUI({
        onStart: handleStartSimulation,
        onStop: handleStopSimulation,
        onReset: handleResetSimulation,
        onSpeedChange: handleSpeedChange
      });
      
      // Initialize simulation last, as it depends on the other systems
      initializeSimulation();

      setSimulationState(prevState => ({
        ...prevState,
        isInitialized: true,
        statistics: getStatistics()
      }));

      console.log('Evolution Morphology Simulator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
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
      statistics: getStatistics()
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
      {/* 
        The actual UI components will be managed by the UI domain.
        The App component just serves as the entry point and coordinator.
        It doesn't directly implement UI components.
      */}
      <div id="simulation-container">
        {/* Canvas will be rendered here by the UI manager */}
      </div>
    </div>
  );
}

export default App;
