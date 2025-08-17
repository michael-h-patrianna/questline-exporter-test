# Questline Demo - Developer Learning Project

This project is a **comprehensive learning resource** for developers who need to understand questline concepts and build their own questline viewers using actual database data. Rather than copying code directly, developers should study this implementation to understand the underlying patterns and data flows.

## 🎯 Purpose & Target Audience

**This demo is designed for:**
- Developers building questline systems for production websites
- Teams integrating questline data from databases into React applications
- Anyone needing to understand questline state management, positioning, and rewards systems

**Key Learning Goals:**
- Understand how questline data flows from source to display
- Learn quest state management patterns (locked → active → unclaimed → completed)
- Comprehend reward system implementation and state cycling
- Grasp positioning systems for different component types
- Master responsive scaling and layout calculations

## 🏗️ Architecture Overview - Separation of Concerns

This project demonstrates **strict separation of concerns** to help developers quickly understand specific concepts:

### 📁 State Management Layer
**Location:** `/src/hooks/useQuestlineState.ts`

**What to study here:**
- How quest progression states are managed
- Component state cycling logic (header, rewards, button states)
- Interactive state patterns for buttons (hover, click, active)

```typescript
// Example: Understanding quest state cycling
const cycleQuestState = (questKey: string) => {
  // locked → active → unclaimed → completed → locked (loops)
}
```

### 📁 Data Transformation Layer
**Location:** `/src/utils/questlineDataTransform.ts`

**What to study here:**
- How Figma export data maps to React component props
- Different positioning systems (top-left, center, center-X + bottom-Y)
- Responsive scaling calculations
- Style property conversion (Figma fills → CSS)

```typescript
// Example: Understanding position system differences
convertQuestPosition()    // Uses top-left coordinates (x,y = corner)
convertTimerPosition()    // Uses center coordinates (x,y = center point)
convertHeaderPosition()   // Uses center-X, bottom-Y coordinates
```

### 📁 Rendering Layer
**Location:** `/src/components/`

**What to study here:**
- Pure display logic without state management
- Component-specific rendering patterns
- Fallback rendering when assets are missing
- CSS custom properties for performance

### 📁 Data Processing Layer
**Location:** `/src/utils/zipExtractor.ts`

**What to study here:**
- How exported questline data is processed
- Asset extraction and URL management
- Error handling for missing or corrupted data

## 🎮 Quest System Concepts

### Quest States & Progression
```
locked → active → unclaimed → completed
  ↑                               ↓
  ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**State Meanings:**
- **locked**: Quest not accessible yet
- **active**: Quest available for completion
- **unclaimed**: Quest completed but rewards not claimed
- **completed**: Quest fully finished and rewards claimed

### Component States

**Header States:** `active → success → fail`
- Used for overall questline status indication

**Rewards States:** `active → fail → claimed`
- Manages reward availability and claiming status

**Button States:** `default ↔ hover ↔ active`
- Handles interactive feedback for primary actions

## 🎨 Positioning Systems Explained

Different questline components use different coordinate systems based on their design needs:

### 1. Quest Components - Center Positioning
```typescript
// centerX,centerY represents the center point of the component
{ centerX: 100, centerY: 50, width: 80, height: 60 }
```
**Use case:** Quest components that need to be centered at specific points

### 2. Timer & Button Components - Center Positioning
```typescript
// x,y represents the center point of the component
{ x: 400, y: 300 } // Component centers at this point
```
**Use case:** Components that need to be centered regardless of content size

### 3. Header Components - Center Positioning
```typescript
// centerX,centerY = center point in both dimensions
{ centerX: 400, centerY: 100 }
```
**Use case:** Headers that need to be centered perfectly in their area

### 4. Rewards Components - True Center Positioning
```typescript
// centerX, centerY = center point in both dimensions
{ centerX: 400, centerY: 300 }
```
**Use case:** Rewards that float and center perfectly in their area

## 💰 Rewards System Implementation

The rewards system demonstrates a three-state progression:

```typescript
// Rewards state flow
'active'   // Rewards available for claiming
    ↓
'fail'     // Claiming failed (timeout, error, etc.)
    ↓
'claimed'  // Successfully claimed
    ↓
'active'   // Ready for next reward cycle
```

**Study Points:**
- State management in `useQuestlineState.ts`
- Visual rendering in `RewardsRenderer.tsx`
- Fallback colors in `questlineDataTransform.ts`

## 📐 Responsive Scaling Logic

The questline viewer automatically scales content while maintaining aspect ratios:

```typescript
// Core scaling calculation
const scaleX = targetWidth / originalWidth;
const scaleY = targetHeight / originalHeight;
const scale = Math.min(scaleX, scaleY); // Uniform scaling
```

**Key Concepts:**
- Uniform scaling prevents distortion
- Component positions scale proportionally
- Content bounds calculation handles overflow
- CSS custom properties enable efficient scaling

## 🔧 Data Flow Architecture

```
ZIP File → Extract Assets → Transform Data → Render Components
    ↓           ↓              ↓              ↓
zipExtractor → questlineData → positioning → visual display
```

**Study the flow:**
1. **ZIP Processing** (`zipExtractor.ts`): Extract images and JSON data
2. **Data Transformation** (`questlineDataTransform.ts`): Convert to render-ready format
3. **State Management** (`useQuestlineState.ts`): Handle interactive states
4. **Component Rendering** (Renderer components): Display with styling

## 🛠️ Quick Start for Developers

### Understanding Specific Concepts

**"How do rewards work?"**
1. Read `useQuestlineState.ts` - reward state cycling logic
2. Read `RewardsRenderer.tsx` - visual presentation
3. Read `questlineDataTransform.ts` - state color mapping

**"How does quest positioning work?"**
1. Read `questlineDataTransform.ts` - position conversion functions
2. Read `QuestRenderer.tsx` - CSS custom properties usage
3. Read `QuestlineViewer.tsx` - scaling calculations

**"How are different component states handled?"**
1. Study the state objects in `types.ts`
2. Follow state cycling in `useQuestlineState.ts`
3. See visual representation in individual renderer components

### Integration Patterns

**Using questline concepts in your own app:**
```typescript
// Pattern 1: State management
const [questStates, setQuestStates] = useState<Record<string, QuestState>>({});

// Pattern 2: Position conversion
const cssProperties = convertQuestPosition(questBounds, currentScale);

// Pattern 3: Component coordination
const renderComponents = () => quests.map(quest =>
  <YourQuestComponent key={quest.id} {...questProps} />
);
```

## 📚 Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
