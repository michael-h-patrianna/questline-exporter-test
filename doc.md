# Questline Demo - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [State Management](#state-management)
5. [Data Structures](#data-structures)
6. [ZIP Processing](#zip-processing)
7. [Rendering System](#rendering-system)
8. [Component Renderers](#component-renderers)
9. [Positioning and Scaling](#positioning-and-scaling)
10. [Asset Management](#asset-management)
11. [CSS and Styling](#css-and-styling)
12. [User Interactions](#user-interactions)
13. [Development Features](#development-features)

## Project Overview

The Questline Demo is a React-based application designed to preview questline data exported from a Figma plugin. It provides an interactive canvas that displays questline components with real-time state management, allowing users to visualize and interact with quest progression, timers, headers, rewards, and buttons.

The project is structured with clear separation of concerns: the **QuestlineViewer** component handles pure display logic and can be used as a standalone component in any React project, while the **App** component provides development features, controls, and debug information.

### Key Features

- **Standalone QuestlineViewer**: Clean, reusable component for displaying questlines
- **ZIP File Processing**: Extracts and parses exported questline data
- **Interactive Preview**: Real-time state changes with click interactions
- **Responsive Canvas**: Scalable questline display with zoom controls
- **Component Support**: Timer, Header, Rewards, Button, and Quest components
- **State Management**: Comprehensive state cycling for all interactive elements
- **Fallback Rendering**: Graceful handling of missing assets
- **Development Tools**: Debug overlays and comprehensive logging (App-level only)

### Using QuestlineViewer as a Standalone Component

The `QuestlineViewer` component can be easily integrated into any React application:

```tsx
import { QuestlineViewer } from './components/QuestlineViewer';
import { ExtractedAssets, QuestlineExport } from './types';

function MyApp() {
  const handleButtonClick = () => {
    // Handle button clicks from questline
    console.log('Quest button clicked!');
  };

  return (
    <QuestlineViewer
      questlineData={yourQuestlineData}
      assets={yourExtractedAssets}
      containerWidth={800}
      containerHeight={600}
      showQuestKeys={false}  // Optional: show quest key overlays
      zoomLevel={1.0}
      onButtonClick={handleButtonClick}
    />
  );
}
```

**Key Benefits of Standalone Usage:**
- No debug overlays or development UI
- Clean, production-ready component
- Customizable button click behavior
- Minimal external dependencies
- Responsive and scalable design

### Technology Stack

- **React 19.1.0** with TypeScript 4.9.5
- **JSZip 3.10.1** for ZIP file processing
- **React Scripts 5.0.1** for build tooling
- **CSS Custom Properties** for theming
- **HTML5 Canvas-like positioning** for component rendering

## Architecture Overview

The application follows a modular React architecture with clear separation of concerns:

```
src/
├── App.tsx                    # Main application component
├── types.ts                   # TypeScript type definitions
├── context/
│   └── QuestlineContext.tsx   # React Context for state management
├── components/
│   ├── QuestlineViewer.tsx    # Main canvas container
│   └── renderers/             # Component-specific renderers
│       ├── QuestRenderer.tsx
│       ├── TimerRenderer.tsx
│       ├── HeaderRenderer.tsx
│       ├── RewardsRenderer.tsx
│       └── ButtonRenderer.tsx
└── utils/
    ├── zipExtractor.ts        # ZIP file processing
    └── positionUtils.ts       # Position calculations and utilities
```

### Component Hierarchy

```
App
├── QuestlineViewer
│   ├── QuestlineProvider (Context)
│   │   ├── TimerRenderer
│   │   ├── HeaderRenderer
│   │   ├── RewardsRenderer
│   │   ├── QuestRenderer (multiple instances)
│   │   └── ButtonRenderer
```

## Core Components

### App.tsx

The main application component handles:

- **File Upload**: ZIP file selection and processing
- **Display Controls**: Container size and zoom level management
- **Application State**: Loading, error, and asset states
- **UI Layout**: Responsive layout with control panels
- **Debug Information**: Development-mode debugging overlay
- **User Interactions**: Button click handling and console logging

Key functionality:
- Responsive container sizing with dynamic bounds calculation
- Preset view modes (Mobile, Desktop, Wide)
- Real-time dimension and zoom controls
- Comprehensive error handling
- Debug overlay showing questline metrics and component status

### QuestlineViewer.tsx

The main canvas component responsible for:

- **Component Orchestration**: Rendering all questline components using individual renderers
- **Scale Calculation**: Responsive scaling based on container dimensions
- **Context Provision**: Initializing QuestlineProvider with quest keys
- **Pure Display Logic**: Only handles questline display without debug or development features

**Props Interface:**
```typescript
interface QuestlineViewerProps {
  questlineData: QuestlineExport;
  assets: ExtractedAssets;
  containerWidth: number;
  containerHeight: number;
  zoomLevel?: number;
  onButtonClick?: () => void;
}
```

**Key Design Principles:**
- **Separation of Concerns**: Only handles questline display coordination
- **Reusability**: Can be dropped into any React project
- **Customizable**: Button click behavior is configurable via props
- **Clean Interface**: No debug overlays or development-specific UI

## State Management

### QuestlineContext

The application uses React Context for centralized state management with the following structure:

```typescript
interface AppState {
  questStates: Record<string, QuestState>;    // Individual quest states
  headerState: HeaderState;                   // Global header state
  rewardsState: RewardsState;                 // Global rewards state
  buttonState: ButtonState;                   // Global button state
  isAnimating: boolean;                       // Animation lock flag
}
```

### State Types

```typescript
type QuestState = 'locked' | 'active' | 'unclaimed' | 'completed';
type HeaderState = 'active' | 'success' | 'fail';
type RewardsState = 'active' | 'fail' | 'claimed';
type ButtonState = 'default' | 'disabled' | 'hover' | 'active';
```

### Context Actions

- **Quest Management**: `setQuestState()`, `cycleQuestState()`
- **Header Management**: `setHeaderState()`, `cycleHeaderState()`
- **Rewards Management**: `setRewardsState()`, `cycleRewardsState()`
- **Button Management**: `setButtonState()`
- **Animation Control**: `setIsAnimating()`, `finishAnimation()`
- **Reset Functionality**: `resetAllStates()`

## Data Structures

### QuestlineExport (Main Data Structure)

```typescript
interface QuestlineExport {
  questlineId: string;           // Unique questline identifier
  frameSize: {                   // Canvas dimensions
    width: number;
    height: number;
  };
  background: {                  // Background image reference
    exportUrl: string;           // Typically "background.png"
  };
  quests: Quest[];              // Array of quest components
  timer?: TimerComponent;       // Optional timer component
  header?: HeaderComponent;     // Optional header component
  rewards?: RewardsComponent;   // Optional rewards component
  button?: ButtonComponent;     // Optional button component
  exportedAt: string;           // ISO timestamp
  metadata: {                   // Export metadata
    totalQuests: number;
    version: string;
  };
}
```

### Quest Component Structure

Each quest supports multiple states with individual positioning:

```typescript
interface Quest {
  questKey: string;             // Unique quest identifier
  stateBounds: {                // Position data for each state
    locked: QuestBounds;
    active: QuestBounds;
    unclaimed: QuestBounds;
    completed: QuestBounds;
  };
  lockedImg: string;           // Image filenames
  activeImg: string;
  unclaimedImg: string;
  completedImg: string;
}

interface QuestBounds {
  x: number;                   // Top-left X coordinate
  y: number;                   // Top-left Y coordinate
  w: number;                   // Width in pixels
  h: number;                   // Height in pixels
  rotation?: number;           // Optional rotation in degrees
}
```

### Specialized Component Types

#### Timer Component
- **Position Mode**: Center coordinates (`x`, `y`)
- **Styling**: Complete typography and background styling
- **Features**: Auto-layout support, padding, shadows, gradients

#### Header Component
- **Position Mode**: Center-X, Bottom-Y coordinates
- **States**: active, success, fail
- **Rotation**: Optional rotation support

#### Rewards Component
- **Position Mode**: Center coordinates (`centerX`, `centerY`)
- **States**: active, fail, claimed
- **Rotation**: Optional rotation support

#### Button Component
- **Position Mode**: Center coordinates (`x`, `y`)
- **States**: default, disabled, hover, active
- **Styling**: Complete frame and text styling per state

## ZIP Processing

### extractQuestlineZip Function

The ZIP extraction process follows this workflow:

1. **Load ZIP File**: Use JSZip to parse the uploaded file
2. **Extract positions.json**: Parse the main questline data
3. **Extract Background**: Load background image if specified
4. **Extract Quest Images**: Load all quest state images
5. **Extract Optional Components**: Load header, rewards images if present
6. **Create Asset URLs**: Generate blob URLs for all images
7. **Return Structured Data**: Provide ExtractedAssets object

```typescript
interface ExtractedAssets {
  questlineData: QuestlineExport;
  backgroundImage?: string;
  questImages: {
    [questKey: string]: {
      locked?: string;
      active?: string;
      unclaimed?: string;
      completed?: string;
    };
  };
  headerImages?: {
    active?: string;
    success?: string;
    fail?: string;
  };
  rewardsImages?: {
    active?: string;
    fail?: string;
    claimed?: string;
  };
}
```

### Error Handling

- **Missing positions.json**: Throws descriptive error with available files
- **Missing Images**: Logs warnings but continues processing
- **Invalid JSON**: Propagates parsing errors with context
- **Blob URL Management**: Automatic cleanup to prevent memory leaks

## Rendering System

### Canvas Architecture

The rendering system uses absolute positioning within a scaled container:

1. **Container Setup**: QuestlineViewer creates a bounded canvas area
2. **Scale Calculation**: positionUtils.calculateScale() determines optimal scaling
3. **Component Positioning**: Each renderer converts coordinates to CSS positions
4. **Z-Index Management**: Layered rendering with proper depth ordering

### Scale Calculation

```typescript
interface ScaleCalculation {
  scale: number;              // Calculated scale factor
  actualWidth: number;        // Scaled canvas width
  actualHeight: number;       // Scaled canvas height
  offsetX: number;           // Horizontal centering offset
  offsetY: number;           // Vertical centering offset
}
```

The scale calculation maintains aspect ratio while fitting within container bounds:

```typescript
function calculateScale(
  frameSize: { width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  zoomLevel: number = 1.0
): ScaleCalculation
```

## Component Renderers

### QuestRenderer

**Responsibilities**:
- Renders quest components with state-based positioning
- Handles click interactions for state cycling
- Provides fallback rendering for missing images
- Shows optional quest key overlays for development/debugging

**Position Conversion**: Uses top-left coordinates (`x`, `y`, `w`, `h`)

**State Cycling**: locked → active → unclaimed → completed → locked

**Quest Key Display**: When `showQuestKeys` prop is enabled, displays quest key overlays on top of quest images as small black badges with white text in the top-left corner. This feature helps with development and testing by making quest identification easier.

### TimerRenderer

**Responsibilities**:
- Renders timer components with center-based positioning (position.x, position.y = center coordinates)
- Handles comprehensive styling via CSS custom properties
- Supports auto-layout with HUG, FILL, and FIXED sizing modes
- Displays static timer content ("05:42")
- Provides fallback styling for missing timer data

**CSS Custom Properties Pattern**:
```css
/* Timer positioning uses CSS transform: translate(-50%, -50%) for centering */
.timer-component {
  left: var(--timer-left);     /* position.x * scale */
  top: var(--timer-top);       /* position.y * scale */
  transform: translate(-50%, -50%); /* Centers the component */
}
```

**Key Implementation Details**:
- Uses `timer.position.x` and `timer.position.y` as center coordinates
- CSS handles centering with `transform: translate(-50%, -50%)`
- Supports advanced layout modes (auto-layout with HUG/FILL/FIXED sizing)
- All styling properties passed via CSS custom properties for performance

**Position Conversion**: Center coordinates to top-left positioning

**Styling Features**:
- Background fills (solid colors and gradients)
- Drop shadows with blur and spread
- Typography with font size, weight, and color
- Border radius scaling

### HeaderRenderer

**Responsibilities**:
- Renders header component with center-X, bottom-Y positioning
- Handles state cycling through click interactions
- Supports rotation transformations

**State Cycling**: active → success → fail → active

**Position Conversion**: centerX, bottomY coordinates to CSS positioning

### RewardsRenderer

**Responsibilities**:
- Renders rewards component with center positioning
- Manages three-state cycling
- Supports rotation and scaling

**State Cycling**: active → fail → claimed → active

**Position Conversion**: centerX, centerY coordinates to CSS positioning

### ButtonRenderer

**Responsibilities**:
- Renders interactive button with hover and click states
- Applies state-specific styling
- Handles mouse interactions (enter, leave, down, up, click)

**Mouse Interaction Flow**:
1. default → hover (on mouse enter)
2. hover → active (on mouse down)
3. active → hover (on mouse up)
4. hover → default (on mouse leave)

**Position Conversion**: Center coordinates with estimated dimensions

## Positioning and Scaling

### Coordinate System Conversion

The application handles multiple positioning modes from Figma exports:

#### Quest Components (Top-Left)
```typescript
function convertQuestPosition(bounds: QuestBounds, scale: number) {
  return {
    left: bounds.x * scale,
    top: bounds.y * scale,
    width: bounds.w * scale,
    height: bounds.h * scale,
    transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined
  };
}
```

#### Timer Components (Center)
```typescript
function convertTimerPosition(timer: TimerComponent, scale: number) {
  const width = timer.dimensions.width * scale;
  const height = timer.dimensions.height * scale;
  return {
    left: (timer.position.x * scale) - (width / 2),
    top: (timer.position.y * scale) - (height / 2),
    width,
    height
  };
}
```

#### Header Components (Center-X, Bottom-Y)
```typescript
function convertHeaderPosition(bounds: HeaderBounds, scale: number) {
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.bottomY * scale) - height,
    width,
    height
  };
}
```

### CSS Style Conversion

#### Fill to CSS Background
```typescript
function convertFillToCSS(fill: Fill): string {
  if (fill.type === 'solid') {
    return fill.color || 'transparent';
  }

  if (fill.type === 'gradient' && fill.gradient) {
    // Handles linear, radial, and angular gradients
    // Converts gradient stops and rotation
  }
}
```

#### Drop Shadows to CSS
```typescript
function convertDropShadowsToCSS(shadows: DropShadow[]): string {
  return shadows
    .map(shadow => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`)
    .join(', ');
}
```

## Asset Management

### Blob URL Lifecycle

1. **Creation**: `URL.createObjectURL()` for each extracted image
2. **Usage**: Blob URLs serve as `src` for img elements
3. **Cleanup**: Automatic cleanup on component unmount to prevent memory leaks

### Fallback Rendering

When images are missing, components render colored rectangles with:
- State-appropriate colors
- Component labels and current state
- Proper dimensions and positioning
- Interactive functionality maintained

### State-Specific Colors

```typescript
function getQuestStateColor(state: string): string {
  const colorMap = {
    locked: '#666666',
    active: '#ffaa00',
    unclaimed: '#00aa00',
    completed: '#0066aa'
  };
  return colorMap[state] || '#999999';
}
```

## CSS and Styling

### Theme System

The application uses CSS custom properties for a cohesive dark theme:

```css
:root {
  --pf-bg: #3a125d;           /* Primary background */
  --pf-surface: #3a125d;      /* Surface background */
  --pf-border: #a96aff;       /* Border and accent color */
  --pf-fg: #ecc3ff;           /* Primary text */
  --pf-fg-strong: #efd7fa;    /* Strong text */
  --pf-muted: #ceb6d8;        /* Muted text */
  --secondary: #4a9d2e;       /* Success/secondary color */
}
```

### Elevation System

```css
--elev-1: 0 6px 18px color-mix(in srgb, var(--pf-fg-strong) 10%, transparent);
--elev-2: 0 12px 36px color-mix(in srgb, var(--pf-fg-strong) 14%, transparent);
```

### Component-Specific Styles

#### QuestlineViewer
- Backdrop blur effects
- Responsive container sizing
- Debug overlay positioning
- Z-index management

#### Controls
- Range input styling with custom thumbs
- Button hover effects with transforms
- Grid layouts for responsive design
- Color-coded component status indicators

### Responsive Design

#### Mobile Breakpoint (≤768px)
- Single-column layouts
- Reduced padding and margins
- Centered preset buttons
- Simplified grid structures

#### Desktop Optimization (≥1200px)
- Grid-based layout with sidebar controls
- Larger questline canvas area
- Side-by-side information panels

## User Interactions

### Click Interactions

#### Quest Components
- **Action**: Click to cycle through states
- **Sequence**: locked → active → unclaimed → completed → locked
- **Feedback**: Visual state change and debug information

#### Header Component
- **Action**: Click to cycle through states
- **Sequence**: active → success → fail → active
- **Feedback**: Image and fallback color changes

#### Rewards Component
- **Action**: Click to cycle through states
- **Sequence**: active → fail → claimed → active
- **Feedback**: Visual state updates

#### Button Component
- **Hover**: default ↔ hover state transitions
- **Click**: active state with immediate feedback
- **Disabled**: Non-interactive state with visual indication

### Mouse Interactions

The button component implements comprehensive mouse interaction:

```typescript
// Mouse enter: default → hover
handleMouseEnter = () => {
  if (currentState !== 'disabled' && !isAnimating) {
    setButtonState('hover');
  }
}

// Mouse down: hover → active
handleMouseDown = () => {
  if (currentState !== 'disabled' && !isAnimating) {
    setButtonState('active');
  }
}
```

### Animation System

- **Animation Lock**: `isAnimating` flag prevents state changes during transitions
- **Transition Effects**: CSS transitions for smooth state changes
- **Opacity Changes**: Visual feedback during animation states
- **Transform Effects**: Scale and rotation animations

## Development Features

### Debug Mode

When `NODE_ENV === 'development'`, the application provides debug information through the App.tsx component:

#### Debug Overlays (App.tsx)
- Questline ID and metadata information
- Frame size and container dimensions
- Current zoom level percentage
- Component count and availability status
- Real-time scale and positioning data

#### Console Logging (App.tsx)
- ZIP extraction progress
- Asset loading status
- Button click interactions
- Error details and stack traces

#### Debug Information Display

```tsx
{process.env.NODE_ENV === 'development' && (
  <div className="debug-overlay">
    <div>Questline: {questlineData.questlineId}</div>
    <div>Frame: {frameSize.width}×{frameSize.height}</div>
    <div>Container: {containerWidth}×{containerHeight}</div>
    <div>Zoom: {(zoomLevel * 100).toFixed(0)}%</div>
    <div>Quests: {questlineData.quests.length}</div>
    <div>Components: Timer:{timer ? '✓' : '✗'} | Header:{header ? '✓' : '✗'} | Rewards:{rewards ? '✓' : '✗'} | Button:{button ? '✓' : '✗'}</div>
  </div>
)}
```

**Note**: The QuestlineViewer component itself contains no debug information, making it suitable for production use and integration into other applications.

### Error Handling

#### ZIP Processing Errors
- Missing positions.json file
- Invalid JSON format
- Missing required assets
- Corrupt ZIP files

#### Runtime Errors
- Invalid component data
- Missing asset URLs
- Calculation errors
- Context usage outside provider

#### User-Friendly Error Messages
- Descriptive error text
- Available file listings
- Suggested corrections
- Graceful degradation

### Performance Considerations

#### Memory Management
- Blob URL cleanup on unmount
- Asset preloading for smooth interactions
- Efficient re-rendering with React.memo potential

#### Responsive Calculations
- Debounced resize handling
- Optimized scale calculations
- Minimal DOM updates

#### Asset Loading
- Lazy loading for large questlines
- Error handling for failed image loads
- Fallback rendering for missing assets

---

## Updated Implementation Summary (2025)

### Key Architectural Changes

**CSS Custom Properties Pattern**: All component renderers use CSS custom properties (CSS variables) for styling instead of direct CSS properties. This improves performance and allows for dynamic styling.

**Positioning Systems**:
1. **Timer & Button**: Center-based positioning using CSS `transform: translate(-50%, -50%)`
2. **Quest**: Top-left positioning using direct CSS `left/top` properties
3. **Header**: Center-X, Bottom-Y with JavaScript-calculated offsets
4. **Rewards**: Center positioning with JavaScript-calculated offsets

**Component Rendering Pattern**:
```tsx
// All renderers follow this pattern:
const cssVariables: Record<string, string> = {
  '--component-left': `${position.x * scale}px`,
  '--component-top': `${position.y * scale}px`,
  // ... other styling properties
};

return (
  <div className="component-class" style={cssVariables}>
    {/* Component content */}
  </div>
);
```

**Timer Component**: The timer component renders a static display showing "05:42" and uses comprehensive CSS custom properties for styling including background fills, shadows, padding, typography, and auto-layout support. Timer positioning is center-based using CSS `transform: translate(-50%, -50%)` for proper horizontal and vertical centering.

**Layout Modes**: Both Timer and Button components properly handle Figma's auto-layout modes:

- **HUG**: Content-based sizing where width/height are determined by content + padding
- **FILL**: Takes up available space (100% width/height)  
- **FIXED**: Uses explicit dimensions from position.json

**Auto-layout Logic**: When `isAutolayout` is true, components default to HUG behavior (content-based sizing) even if `layoutSizing` is undefined. This ensures that auto-layout components properly size themselves based on content rather than falling back to fixed dimensions.**State Management**: All interactive state management is handled by the QuestlineContext at the application level. Individual renderers are pure display components that receive their current state as props.

**QuestlineViewer Props**: The standalone QuestlineViewer component expects:
```tsx
interface QuestlineViewerProps {
  questlineData: QuestlineExport;
  assets: ExtractedAssets;
  questlineWidth: number;   // Target display width
  questlineHeight: number;  // Target display height
  showQuestKeys?: boolean;  // Show quest key overlays on quest images
  onButtonClick?: () => void;
}
```

**Quest Key Display**: The optional `showQuestKeys` prop enables quest key overlays that appear on top of quest images, making it easier to identify quests during development and testing. When enabled, small black overlays with white text display the quest key in the top-left corner of each quest component.

---
This documentation provides a comprehensive technical overview of the Questline Demo application, covering its architecture, components, data flow, and implementation details. The application successfully bridges Figma export data with interactive React components, providing a robust preview system for questline designs.
