# Evolution Morphology Simulator - Project Plan

## MVP Features

### Core Features
1. **Basic Morphological System**
   - 2D representation of organisms
   - Limited set of body parts/traits that can evolve
   - Visual distinction between different phenotypes

2. **Simple Evolution Engine**
   - Basic genome encoding for morphological traits
   - Mutation and inheritance system
   - Simple selection pressure (e.g., ability to gather resources)

3. **Minimal Environment**
   - Single habitat with basic resources (food particles)
   - Simple physics for movement and collision

4. **Essential UI Controls**
   - Start/pause/reset controls
   - Speed adjustment
   - Basic parameter settings (mutation rate, etc.)

5. **Basic Visualization**
   - Canvas-based rendering of organisms
   - Simple statistics display

### Features to Add Post-MVP
- Multiple habitats and environmental pressures
- Predator-prey dynamics
- Detailed evolutionary history/phylogenetic tree
- Complex physics interactions
- Save/load functionality

## Next Steps in Detail

### 1. Organism Representation System

For our MVP, we will implement:

**Body Structure:**
- Central body component with properties (size, shape)
- Appendages (limbs, fins, flagella) with properties:
  - Length, width, position, angle
  - Strength (affecting speed and energy cost)
- Simple sensors with detection range and sensitivity
- Basic defensive features (shells, spikes)

**Visual Implementation:**
- Use Canvas API for performance with many organisms
- Color-coding to represent different trait expressions
- Simple animations for movement

### 2. Genetic Encoding System

For the MVP:

```javascript
// Example genome structure
{
  bodySize: { value: 0.65, mutationRate: 0.03 },
  bodyShape: { value: 0.2, mutationRate: 0.02 },
  appendages: [
    {
      type: "fin",
      length: { value: 0.7, mutationRate: 0.05 },
      position: { value: 0.2, mutationRate: 0.01 }, // position along body
      angle: { value: 0.5, mutationRate: 0.04 }
    }
  ],
  metabolism: { value: 0.5, mutationRate: 0.03 },
  sensorRange: { value: 0.4, mutationRate: 0.02 }
}
```

- All values normalized between 0-1
- Direct mapping from genotype to phenotype
- Simple trait interactions (e.g., body size affects energy needs)

### 3. Evolution Mechanics

**Core Mechanics:**
- **Reproduction:** Asexual reproduction requiring energy threshold
- **Mutation:** Random variations based on gene's mutation rate
- **Selection:** Energy efficiency as primary selection factor
- **Fitness Function:** Energy gained - energy spent on movement

**Interaction Loop:**
1. Organisms move to find resources
2. Resource collection adds energy
3. Movement costs energy based on morphology
4. Organisms with sufficient energy reproduce
5. Offspring inherit traits with mutations
6. Organisms without energy die

### 4. Project Structure

Following architectural guidelines:

```
src/
│
├── app.js                          # High-level coordinator
│
├── organism/                       # Organism Domain
│   ├── organism-manager.js         # Domain manager for organisms
│   ├── morphology-renderer.js      # Renders organism appearance
│   ├── trait-processor.js          # Processes traits into physical properties
│   └── movement-controller.js      # Handles organism movement
│
├── evolution/                      # Evolution Domain
│   ├── evolution-manager.js        # Domain manager for evolution
│   ├── genome-processor.js         # Handles genetic encoding/decoding
│   ├── mutation-engine.js          # Generates mutations
│   └── selection-calculator.js     # Calculates fitness and applies selection
│
├── simulation/                     # Simulation Domain
│   ├── simulation-manager.js       # Domain manager for simulation
│   ├── resource-controller.js      # Manages resources in environment
│   ├── collision-detector.js       # Handles physical interactions
│   └── simulation-clock.js         # Controls simulation timing
│
├── ui/                             # UI Domain
│   ├── ui-manager.js               # Domain manager for UI
│   ├── canvas-renderer.js          # Renders the simulation to canvas
│   ├── control-panel.js            # Manages simulation controls
│   └── stats-display.js            # Shows simulation statistics
│
├── data/                           # Data Domain
│   ├── data-manager.js             # Domain manager for data
│   ├── population-tracker.js       # Tracks population statistics
│   └── performance-monitor.js      # Monitors simulation performance
│
└── utils/                          # Global Utilities
    ├── core.js                     # Constants and foundational utilities
    └── math-utils.js               # Math functions used across domains
```

## Technical Implementation Details

### Recommended Technologies
- **React** for the UI framework
- **Canvas API** for performant rendering of many organisms
- **React Context API** for state management (simpler than Redux for MVP)

### Core Algorithms to Develop
1. **Genotype to Phenotype Mapping**:
   - Transforming genome values into visual traits
   - Calculating derived properties (speed, energy cost)

2. **Movement Algorithm**:
   - Translating morphology into movement capability
   - Resource seeking behavior

3. **Selection Algorithm**:
   - Energy acquisition and expenditure calculation
   - Reproduction eligibility determination

4. **Mutation Algorithm**:
   - Random variations based on mutation rates
   - Occasional large mutations (feature additions/removals)

### Key Data Structures

1. **Organism Object**:
```javascript
{
  id: "unique-id-123",
  genome: {/* genome structure */},
  phenotype: {
    bodySize: 0.65,
    bodyShape: 0.2,
    appendages: [
      {
        type: "fin",
        length: 0.7,
        position: 0.2,
        angle: 0.5
      }
    ],
    metabolism: 0.5,
    sensorRange: 0.4
  },
  state: {
    position: { x: 120, y: 85 },
    velocity: { x: 0.3, y: -0.1 },
    energy: 75,
    age: 42
  }
}
```

2. **Environment Object**:
```javascript
{
  resources: [
    { id: "food-1", type: "food", position: { x: 200, y: 150 }, value: 25 },
    // More resources...
  ],
  boundaries: {
    width: 800,
    height: 600
  },
  parameters: {
    resourceRegenerationRate: 0.01,
    maxResources: 50
  }
}
```

3. **Simulation State**:
```javascript
{
  running: true,
  speed: 1.5,
  currentGeneration: 8,
  statistics: {
    populationSize: 37,
    averageLifespan: 84,
    dominantTraits: {
      bodySize: 0.72,
      // More trait statistics...
    }
  }
}
```

## Implementation Plan

### 1. Foundation Phase
- Set up React project with appropriate folder structure
- Implement basic UI framework
- Create simple Canvas rendering system
- Design core data structures

**Deliverables:**
- Project scaffolding
- Basic UI components
- Canvas rendering foundation
- Initial data models

### 2. Organism Phase
- Implement genome structure and validation
- Create phenotype generation system
- Develop basic organism visualization
- Implement simple movement behavior

**Deliverables:**
- Genome to phenotype mapping system
- Basic organism renderer
- Movement algorithm prototype
- Organism interaction tests

### 3. Evolution Phase
- Implement mutation system
- Create reproduction mechanism
- Add resource system
- Develop basic selection algorithm

**Deliverables:**
- Mutation engine
- Reproduction handler
- Resource distribution system
- Selection mechanism

### 4. Simulation Phase
- Connect evolutionary systems
- Implement simulation controls
- Add time management
- Create statistics tracking

**Deliverables:**
- Full simulation loop
- Control panel functionality
- Time control system
- Basic statistics display

### 5. Refinement Phase
- Optimize rendering for many organisms
- Improve organism visualization
- Balance evolution parameters
- Enhance user experience

**Deliverables:**
- Performance optimizations
- Enhanced visuals
- Balanced simulation
- Improved UI/UX

## Success Criteria

The MVP will be considered successful when:

1. Organisms with different morphologies can be visualized
2. Evolution occurs through generations with visible morphological changes
3. Selection pressure visibly affects population characteristics
4. The simulation runs smoothly with 50+ organisms
5. Basic controls allow user interaction with the simulation
6. Simple statistics show evolutionary trends

## Next Steps After MVP

After completing the MVP, potential directions include:

1. Adding multiple habitats with different selection pressures
2. Implementing predator-prey dynamics
3. Creating a more detailed evolutionary history visualization
4. Adding more complex physics interactions
5. Implementing save/load functionality
6. Adding user-defined selection pressures
7. Creating a more detailed UI for organism inspection