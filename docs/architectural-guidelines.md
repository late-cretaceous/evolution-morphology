# General Architectural Guidelines for Application Development

This document outlines the architectural principles and separation of concerns to be followed throughout the development of any application.

## Module Hierarchy

The application follows a strict hierarchical structure with clearly defined communication paths:

### 1. High-Level Coordinators
*Examples: `app.js`, `main.js`*

- Act as the top-level API for client code
- Coordinate flow between major application domains
- **Rules**:
  - May only call other coordinators or Domain Managers
  - Must NEVER bypass domain managers to call their subordinate modules
  - Should not implement domain-specific logic directly

### 2. Domain Managers
*Examples: `user-manager.js`, `data-manager.js`, `notification-manager.js`*

- Serve as the ONLY entry point to their domain's functionality
- Coordinate operations between their domain's utility modules
- **Rules**:
  - Responsible for ALL operations within their domain
  - May call their own utility modules or other domain managers
  - Should transform data as needed between domain boundaries
  - Must validate inputs and handle errors within their domain

### 3. Utility Modules
*Examples: `user-authentication.js`, `data-validation.js`, `notification-formatter.js`*

- Provide specialized services within a specific domain
- Implement core algorithms and business logic
- **Rules**:
  - Should NEVER be called directly from outside their domain
  - Must be accessed through their parent domain manager
  - Should focus on a single responsibility
  - May only call other utilities within the same domain

### 4. Global Utilities
*Example: `core.js`, `utils.js`*

- Provide foundational constants and functions used across multiple domains
- Implement common, fundamental operations needed broadly throughout the application
- **Rules**:
  - May be imported by both high-level coordinators and domain managers
  - Should focus on pure, stateless functions without domain-specific logic
  - Should not depend on any domain-specific modules
  - Should be truly foundational to warrant global access

> **Important**: Only designate a small number of modules as global utilities. All other utilities must adhere to the domain-specific utility rules above.

## Domain Boundaries

Here are examples of common application domains. Your specific application may have different domains, but the principle of clear boundaries applies universally:

### Application Domain (`app.js`)
- Application initialization and configuration
- Feature coordination
- Overall application flow
- Route management
- High-level state management

### User Domain (`user-manager.js`)
- Authentication (`user-authentication.js`)
- User preferences (`user-preferences.js`)
- Profile management (`profile-manager.js`)
- Permission handling (`permissions.js`)
- ALL user-related operations

### Data Domain (`data-manager.js`)
- Data retrieval and storage (`data-storage.js`)
- Query building (`query-builder.js`)
- Data transformation (`data-transformer.js`)
- Caching strategies (`caching.js`)
- ALL data-related operations

### UI Domain (`ui-manager.js`)
- Component rendering
- Theme management (`theme-manager.js`)
- Layout orchestration (`layout-manager.js`)
- Animation coordination (`animation-service.js`)
- ALL UI-related operations

### Network Domain (`network-manager.js`)
- API communication (`api-client.js`)
- Request handling (`request-handler.js`)
- Response parsing (`response-parser.js`)
- Error handling (`error-handler.js`)
- ALL network-related operations

## Domain Relationship Diagram

```
High-Level Coordinator
└── app.js
    ├── user-manager.js (domain manager)
    │   ├── user-authentication.js (utility)
    │   └── permissions.js (utility)
    ├── data-manager.js (domain manager)
    │   ├── data-storage.js (utility)
    │   └── data-transformer.js (utility)
    ├── ui-manager.js (domain manager)
    │   ├── theme-manager.js (utility)
    │   └── layout-manager.js (utility)
    └── network-manager.js (domain manager)
        ├── api-client.js (utility)
        └── response-parser.js (utility)

Global Utilities
└── core.js (accessible to all domains)
└── utils.js (accessible to all domains)
```

## Data Flow Principles

1. **Hierarchical Flow**: Data should flow down from coordinators to domain managers to utilities, and results should flow back up through the same path.

2. **Domain Transformation**: Domain managers are responsible for transforming data at domain boundaries to ensure proper encapsulation.

3. **Consistent Data Structures**: Use consistent object structures for domain entities (users, products, orders, etc.) across domain boundaries.

4. **Clear Interface Contracts**: Each module should have clear input/output specifications that don't leak implementation details.

## Common Architecture Violations to Avoid

If you encounter any of these patterns, refactor immediately:

1. **Domain Bypassing**: A high-level module imports a utility module from another domain
   - ❌ `app.js` imports `data-storage.js`
   - ✅ `app.js` calls `data-manager.js` which uses `data-storage.js`

2. **Cross-domain Utility Access**: A utility module from one domain accessed by another domain
   - ❌ `user-authentication.js` used directly by `data-manager.js`
   - ✅ `data-manager.js` communicates with `user-manager.js` which then uses `user-authentication.js`

3. **Functionality Duplication**: Similar functionality implemented in multiple places
   - ❌ Validation logic in both `app.js` and `data-storage.js`
   - ✅ Validation logic only in `data-validation.js` within the data domain

4. **Utility Exposure**: A domain's internal utilities are exposed to outside modules
   - ❌ Exporting `createApiRequest()` for use outside the network domain
   - ✅ Encapsulating API request creation within the network domain

5. **Responsibility Leakage**: A high-level module manages low-level details
   - ❌ `app.js` handling data transformation calculations
   - ✅ `app.js` delegating ALL data concerns to `data-manager.js`

6. **Circular Dependencies**: Modules depending on each other directly or indirectly
   - ❌ `theme-manager.js` imports from `ui-manager.js`
   - ✅ Both modules import from utility modules or core constants

7. **Global Utility Proliferation**: Making multiple domain-specific utilities global
   - ❌ Making `data-transformer.js` a global utility accessible everywhere
   - ✅ Keeping `data-transformer.js` as a domain-specific utility accessed through its domain manager

## Special Note on Global Utilities

Unlike other utilities, global utilities (e.g., `core.js`, `utils.js`) may be imported by both high-level coordinators and domain managers. This exception is justified because:

1. They provide truly foundational constants and functions needed across domains
2. They have no dependencies on other modules
3. Their functions are pure and stateless
4. They contain no domain-specific logic

Even with this exception, be judicious in what functionality goes into global utilities. If a function is specific to a particular domain, it should be placed in a domain-specific utility.

## Code Style for Maintaining Separation

1. **Import Organization**: Group imports by domain for clarity
   ```javascript
   // High-level coordinators
   import { initializeApp } from './app';
   
   // Global utilities
   import { CONSTANTS, formatDate } from './core';
   
   // Domain managers - only these should be imported from other domains
   import { authenticateUser } from './user/user-manager';
   import { fetchData } from './data/data-manager';
   import { sendRequest } from './network/network-manager';
   
   // Domain-internal utilities - never import these across domains
   import { validatePassword } from './user/user-validation'; // WRONG
   ```

2. **Function Documentation**: Clearly indicate domain and allowed callers
   ```javascript
   /**
    * Authenticates a user with the provided credentials
    * @domain User
    * @calledBy App domain only
    * @param {Object} credentials - User credentials
    * @returns {Object} Authentication result with user information
    */
   export function authenticateUser(credentials) {
     // Implementation
   }
   ```

3. **Module Headers**: Include domain and responsibility annotations
   ```javascript
   /**
    * @module data-validation
    * @domain Data
    * @responsibility Validates data structures and field values
    * @private Should only be used by data-manager.js
    */
   ```

## Development Workflow

1. **Before Implementation**: Review module specifications to understand domain boundaries

2. **During Implementation**: Restrict imports to maintain proper hierarchical structure

3. **Code Review**: Verify separation of concerns and proper module communication

4. **Refactoring**: Address any architectural violations promptly before they propagate

## Pull Request Checklist

Before submitting changes, verify:

- [ ] Any added functionality exists in the appropriate module based on domain
- [ ] No domain boundary violations (high-level modules calling domain utilities)
- [ ] No duplicate implementations of the same functionality
- [ ] Clear input/output contracts for all new functions
- [ ] Consistent parameter and return value structures
- [ ] All imports follow the hierarchical structure (coordinators → domain managers → utilities)
- [ ] Updated module specifications reflect any functional changes
- [ ] Appropriate domain manager created for new functionality domains
- [ ] Careful use of global utilities — only truly global functionality belongs there

## Maintenance and Evolution

As the application evolves:

1. Update this document when architectural decisions change
2. Ensure new modules fit within the existing domain structure
3. Consider refactoring if domains become too large or responsibilities blur
4. Maintain backward compatibility at domain boundaries when possible
5. Create new domain managers for distinct areas of functionality rather than expanding existing ones

## Example: Adding New Functionality

### ❌ Incorrect Approach
```javascript
// In app.js (High-level coordinator)
import { validateUserData } from './user-validation';

export function createUser(userData) {
  // Validate user data directly in app.js
  const validatedData = validateUserData(userData);
  // Create user with validated data
}
```

### ✅ Correct Approach
```javascript
// In app.js (High-level coordinator)
import { createUser } from './user-manager';

export function registerNewUser(userData) {
  // Use the domain manager for user operations
  return createUser(userData);
}

// In user-manager.js (Domain manager)
import { validateUserData } from './user-validation';

export function createUser(userData) {
  // Delegate to utility module for implementation details
  const validatedData = validateUserData(userData);
  // Create user with validated data and return
}
```

This ensures that the high-level coordinator (`app.js`) never directly accesses utility modules, maintaining proper separation of concerns and clear domain boundaries.