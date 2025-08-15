# React Preview Project Guide

## Overview

This guide provides comprehensive instructions for building a React application that can preview exported Figma questline data. The preview application will:

- Open and parse exported ZIP files from the Figma questline exporter
- Display interactive component previews with state management
- Provide canvas scaling and responsive viewing
- Enable clicking and state changes for exported elements

## Project Architecture

### Core Components
1. **ZipParser** - Handles ZIP file extraction and validation
2. **CanvasRenderer** - Manages the preview canvas and scaling
3. **ComponentRenderer** - Renders individual questline components
4. **StateManager** - Handles interactive state changes
5. **AssetLoader** - Manages image loading and caching

### Technology Stack
- **React 18+** with TypeScript
- **Canvas API** or **SVG** for rendering
- **JSZip** for ZIP file processing
- **React Context** for state management
- **CSS-in-JS** or **Styled Components** for dynamic styling

## Project Setup

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "jszip": "^3.10.1",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
```

### Basic Project Structure

```
src/
├── components/
│   ├── ZipUploader.tsx
│   ├── PreviewCanvas.tsx
│   ├── ComponentRenderer.tsx
│   ├── StateControls.tsx
│   └── ScaleControls.tsx
├── context/
│   └── QuestlineContext.tsx
├── hooks/
│   ├── useZipParser.ts
│   ├── useCanvasScale.ts
│   └── useComponentState.ts
├── services/
│   ├── zipParser.ts
│   ├── assetLoader.ts
│   └── componentRenderer.ts
├── types/
│   └── questline.ts
└── App.tsx
```

## Export Format Understanding

The Figma questline exporter creates ZIP files containing:

### File Structure
```
questline_export.zip
├── positions.json          # Main data file
├── background.png          # Background image
├── quest1_locked.png       # Quest state images
├── quest1_active.png
├── quest1_unclaimed.png
├── quest1_completed.png
├── quest2_locked.png       # Additional quest images
├── quest2_active.png
├── quest2_unclaimed.png
├── quest2_completed.png
├── header_active.png       # Header state images (optional)
├── header_success.png
├── header_fail.png
├── rewards_active.png      # Rewards state images (optional)
├── rewards_fail.png
├── rewards_claimed.png
└── ...                     # Additional quest/component images
```

### positions.json Schema

The `positions.json` file is the heart of the export, containing all component data and positioning information.

#### Root Structure

```typescript
interface QuestlineExport {
  questlineId: string;           // Unique identifier for the questline
  frameSize: {                   // Canvas dimensions
    width: number;               // Width in pixels
    height: number;              // Height in pixels
  };
  background: {                  // Background image reference
    exportUrl: string;           // Always "background.png"
  };
  quests: Quest[];              // Array of quest components
  timer?: TimerComponent;       // Optional timer component
  header?: HeaderComponent;     // Optional header component
  rewards?: RewardsComponent;   // Optional rewards component
  button?: ButtonComponent;     // Optional button component
  exportedAt: string;           // ISO timestamp
  metadata: {                   // Export metadata
    totalQuests: number;        // Number of quests
    exportFormat: string;       // Always "png"
    version: string;            // Format version
  };
}
```

#### Quest Component Structure

Each quest has multiple states with individual positioning and image references:

```typescript
interface Quest {
  questKey: string;             // Unique quest identifier
  stateBounds: {                // Position data for each state
    locked: QuestBounds;        // Locked state positioning
    active: QuestBounds;        // Active state positioning
    unclaimed: QuestBounds;     // Unclaimed state positioning
    completed: QuestBounds;     // Completed state positioning
  };
  lockedImg: string;           // "quest1_locked.png"
  activeImg: string;           // "quest1_active.png"
  unclaimedImg: string;        // "quest1_unclaimed.png"
  completedImg: string;        // "quest1_completed.png"
}

interface QuestBounds {
  x: number;                   // X position (top-left)
  y: number;                   // Y position (top-left)
  w: number;                   // Width in pixels
  h: number;                   // Height in pixels
  rotation?: number;           // Rotation in degrees (optional)
}
```

#### Timer Component (Optional)

```typescript
interface TimerComponent {
  position: {                  // Center position
    x: number;                 // Center X coordinate
    y: number;                 // Center Y coordinate
  };
  dimensions: {                // Size information
    width: number;             // Width in pixels
    height: number;            // Height in pixels
  };
  borderRadius: number;        // Corner radius
  backgroundFill: Fill;        // Background styling
  isAutolayout: boolean;       // Whether uses auto-layout
  layoutSizing?: {             // Layout sizing modes
    horizontal: "FIXED" | "HUG" | "FILL";
    vertical: "FIXED" | "HUG" | "FILL";
  };
  padding: {                   // Internal padding
    vertical: number;          // Top/bottom padding
    horizontal: number;        // Left/right padding
  };
  dropShadows: DropShadow[];   // Shadow effects
  textStyle: {                 // Text styling
    fontSize: number;          // Font size in pixels
    color: string;             // Hex color with opacity
    fontWeight?: number;       // Font weight (100-900)
    textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
    textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  };
}
```

#### Header Component (Optional)

```typescript
interface HeaderComponent {
  stateBounds: {               // Position data for each state
    active: HeaderBounds;      // Active state positioning
    success: HeaderBounds;     // Success state positioning
    fail: HeaderBounds;        // Fail state positioning
  };
  activeImg: string;           // "header_active.png"
  successImg: string;          // "header_success.png"
  failImg: string;             // "header_fail.png"
}

interface HeaderBounds {
  centerX: number;             // Center X coordinate
  bottomY: number;             // Bottom Y coordinate
  width: number;               // Width in pixels
  height: number;              // Height in pixels
  rotation?: number;           // Rotation in degrees (optional)
}
```

#### Rewards Component (Optional)

```typescript
interface RewardsComponent {
  stateBounds: {               // Position data for each state
    active: RewardsBounds;     // Active state positioning
    fail: RewardsBounds;       // Fail state positioning
    claimed: RewardsBounds;    // Claimed state positioning
  };
  activeImg: string;           // "rewards_active.png"
  failImg: string;             // "rewards_fail.png"
  claimedImg: string;          // "rewards_claimed.png"
}

interface RewardsBounds {
  centerX: number;             // Center X coordinate
  centerY: number;             // Center Y coordinate
  width: number;               // Width in pixels
  height: number;              // Height in pixels
  rotation?: number;           // Rotation in degrees (optional)
}
```

#### Button Component (Optional)

The button component includes detailed styling information for each state:

```typescript
interface ButtonComponent {
  position: {                  // Center position
    x: number;                 // Center X coordinate
    y: number;                 // Center Y coordinate
  };
  stateStyles: {               // Styling for each button state
    default: ButtonStateStyle; // Default button appearance
    disabled: ButtonStateStyle; // Disabled state appearance
    hover: ButtonStateStyle;   // Hover state appearance
    active: ButtonStateStyle;  // Active/pressed state appearance
  };
}

interface ButtonStateStyle {
  frame: {                     // Frame styling properties
    borderRadius: number;      // Corner radius
    backgroundFill: Fill;      // Background color/gradient
    isAutolayout: boolean;     // Whether uses auto-layout
    layoutSizing?: {           // Layout sizing modes
      horizontal: "FIXED" | "HUG" | "FILL";
      vertical: "FIXED" | "HUG" | "FILL";
    };
    padding: {                 // Internal padding
      vertical: number;        // Top/bottom padding
      horizontal: number;      // Left/right padding
    };
    dropShadows: DropShadow[]; // Shadow effects
    stroke?: {                 // Border styling (optional)
      width: number;           // Border width
      color: string;           // Border color (hex with opacity)
    };
  };
  text: {                      // Text styling properties
    fontSize: number;          // Font size in pixels
    color: string;             // Text color (hex with opacity)
    fontWeight?: number;       // Font weight (100-900)
    textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
    textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  };
}
```

#### Shared Type Definitions

```typescript
// Fill types for backgrounds and colors
interface Fill {
  type: "solid" | "gradient";
  color?: string;              // Hex color (for solid fills)
  gradient?: Gradient;         // Gradient data (for gradient fills)
}

interface Gradient {
  type: "linear" | "radial" | "angular";
  stops: GradientStop[];       // Color stops
  rotation?: number;           // Rotation angle in degrees (linear gradients)
}

interface GradientStop {
  color: string;               // Hex color with opacity
  position: number;            // Position (0-1)
}

// Drop shadow effect
interface DropShadow {
  x: number;                   // Horizontal offset
  y: number;                   // Vertical offset
  blur: number;                // Blur radius
  spread: number;              // Spread radius
  color: string;               // Shadow color (hex with opacity)
}
```

#### Example positions.json

Here's a complete example showing all components:

```json
{
  "questlineId": "treasure_hunt",
  "frameSize": {
    "width": 531,
    "height": 797
  },
  "background": {
    "exportUrl": "background.png"
  },
  "timer": {
    "position": { "x": 265.5, "y": 90 },
    "dimensions": { "width": 153, "height": 32 },
    "borderRadius": 100,
    "backgroundFill": {
      "type": "gradient",
      "gradient": {
        "type": "linear",
        "rotation": 90,
        "stops": [
          { "color": "#ff99ba", "position": 0 },
          { "color": "#31c26d", "position": 0.5 },
          { "color": "#0f074f", "position": 1 }
        ]
      }
    },
    "isAutolayout": true,
    "padding": { "vertical": 8, "horizontal": 16 },
    "dropShadows": [
      { "x": 5, "y": 4, "blur": 4, "spread": 0, "color": "#cb1818" }
    ],
    "textStyle": {
      "fontSize": 16,
      "color": "#1d092f",
      "fontWeight": 600,
      "textAlignHorizontal": "CENTER"
    }
  },
  "quests": [
    {
      "questKey": "quest1",
      "stateBounds": {
        "locked": { "x": 76, "y": 581, "w": 80, "h": 80, "rotation": 0 },
        "active": { "x": 76, "y": 581, "w": 80, "h": 80, "rotation": 0 },
        "unclaimed": { "x": 76, "y": 581, "w": 80, "h": 80, "rotation": 0 },
        "completed": { "x": 76, "y": 581, "w": 80, "h": 80, "rotation": 0 }
      },
      "lockedImg": "quest1_locked.png",
      "activeImg": "quest1_active.png",
      "unclaimedImg": "quest1_unclaimed.png",
      "completedImg": "quest1_completed.png"
    }
  ],
  "exportedAt": "2025-08-14T19:27:12.168Z",
  "metadata": {
    "totalQuests": 4,
    "exportFormat": "png",
    "version": "2.1"
  }
}
```

## Canvas Rendering and Scaling

### Canvas Architecture

The preview system uses a responsive canvas approach that maintains aspect ratio while allowing zoom and pan functionality.

#### Core Rendering Concepts

1. **Coordinate System**: All positions in `positions.json` are in Figma's coordinate system (top-left origin)
2. **Scaling**: The canvas scales proportionally to fit the container while maintaining aspect ratio
3. **Positioning Modes**: Different components use different positioning modes:
   - **Quests**: Top-left coordinates (`x`, `y`, `w`, `h`)
   - **Timer**: Center coordinates (`x`, `y` = center point)
   - **Header**: Center-X, Bottom-Y coordinates (`centerX`, `bottomY`)
   - **Rewards**: Center coordinates (`centerX`, `centerY`)
   - **Button**: Center coordinates (`x`, `y` = center point)

#### Scaling Mathematics

```typescript
interface ScaleCalculation {
  // Calculate scale to fit container while maintaining aspect ratio
  scale: number;              // Scale factor (0.1 to 5.0 typical range)
  actualWidth: number;        // Scaled canvas width
  actualHeight: number;       // Scaled canvas height
  offsetX: number;           // Horizontal centering offset
  offsetY: number;           // Vertical centering offset
}

function calculateScale(
  frameSize: { width: number; height: number },
  containerSize: { width: number; height: number },
  zoomLevel: number = 1.0
): ScaleCalculation {
  // Base scale to fit container
  const baseScale = Math.min(
    containerSize.width / frameSize.width,
    containerSize.height / frameSize.height
  );

  // Apply zoom level
  const scale = baseScale * zoomLevel;

  // Calculate actual dimensions
  const actualWidth = frameSize.width * scale;
  const actualHeight = frameSize.height * scale;

  // Calculate centering offsets
  const offsetX = (containerSize.width - actualWidth) / 2;
  const offsetY = (containerSize.height - actualHeight) / 2;
  return { scale, actualWidth, actualHeight, offsetX, offsetY };
}
```

#### Position Conversion Functions

```typescript
// Convert quest bounds (top-left coordinates)
function convertQuestPosition(
  bounds: { x: number; y: number; w: number; h: number },
  scale: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: bounds.x * scale,
    top: bounds.y * scale,
    width: bounds.w * scale,
    height: bounds.h * scale
  };
}

// Convert timer position (center coordinates)
function convertTimerPosition(
  timer: { position: { x: number; y: number }; dimensions: { width: number; height: number } },
  scale: number
): { left: number; top: number; width: number; height: number } {
  const width = timer.dimensions.width * scale;
  const height = timer.dimensions.height * scale;
  return {
    left: (timer.position.x * scale) - (width / 2),
    top: (timer.position.y * scale) - (height / 2),
    width,
    height
  };
}

// Convert header position (centerX, bottomY coordinates)
function convertHeaderPosition(
  bounds: { centerX: number; bottomY: number; width: number; height: number },
  scale: number
): { left: number; top: number; width: number; height: number } {
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.bottomY * scale) - height,
    width,
    height
  };
}

// Convert rewards position (centerX, centerY coordinates)
function convertRewardsPosition(
  bounds: { centerX: number; centerY: number; width: number; height: number },
  scale: number
): { left: number; top: number; width: number; height: number } {
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.centerY * scale) - (height / 2),
    width,
    height
  };
}
```

### Responsive Canvas Implementation

#### Canvas Container Component

```typescript
interface CanvasProps {
  questlineData: QuestlineExport;
  containerWidth: number;
  containerHeight: number;
  zoomLevel: number;
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;
}

function PreviewCanvas({
  questlineData,
  containerWidth,
  containerHeight,
  zoomLevel,
  questStates,
  headerState,
  rewardsState,
  buttonState
}: CanvasProps) {
  // Calculate scaling
  const scaleData = calculateScale(
    questlineData.frameSize,
    { width: containerWidth, height: containerHeight },
    zoomLevel
  );

  return (
    <div
      className="canvas-container"
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'hidden',
        position: 'relative',
        background: '#f0f0f0'
      }}
    >
      <div
        className="canvas-content"
        style={{
          width: scaleData.actualWidth,
          height: scaleData.actualHeight,
          position: 'absolute',
          left: scaleData.offsetX,
          top: scaleData.offsetY,
          backgroundImage: `url(${questlineData.background.exportUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Render components here */}
      </div>
    </div>
  );
}
```

## Interactive State Management

### State Architecture

The preview application manages multiple types of interactive states that mirror the exported Figma components.

#### Component State Types

```typescript
// Quest component states
type QuestState = 'locked' | 'active' | 'unclaimed' | 'completed';

// Header component states
type HeaderState = 'active' | 'success' | 'fail';

// Rewards component states
type RewardsState = 'active' | 'fail' | 'claimed';

// Button component states
type ButtonState = 'default' | 'disabled' | 'hover' | 'active';

// Global application state
interface AppState {
  questStates: Record<string, QuestState>;    // questKey -> current state
  headerState: HeaderState;                   // Global header state
  rewardsState: RewardsState;                 // Global rewards state
  buttonState: ButtonState;                   // Global button state
  canvasScale: number;                        // Current zoom level
  selectedQuest: string | null;               // Currently selected quest
  isAnimating: boolean;                       // Animation lock
}
```

#### React Context for State Management

```typescript
interface QuestlineContextValue {
  // State
  state: AppState;
  questlineData: QuestlineExport | null;

  // Actions
  setQuestState: (questKey: string, newState: QuestState) => void;
  setHeaderState: (newState: HeaderState) => void;
  setRewardsState: (newState: RewardsState) => void;
  setButtonState: (newState: ButtonState) => void;
  setCanvasScale: (scale: number) => void;
  selectQuest: (questKey: string | null) => void;

  // Bulk operations
  setAllQuestsState: (newState: QuestState) => void;
  resetAllStates: () => void;

  // Animation control
  startAnimation: () => void;
  finishAnimation: () => void;
}

const QuestlineContext = createContext<QuestlineContextValue | null>(null);

function QuestlineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    questStates: {},
    headerState: 'active',
    rewardsState: 'active',
    buttonState: 'default',
    canvasScale: 1.0,
    selectedQuest: null,
    isAnimating: false
  });

  const [questlineData, setQuestlineData] = useState<QuestlineExport | null>(null);

  // State update functions
  const setQuestState = useCallback((questKey: string, newState: QuestState) => {
    if (state.isAnimating) return; // Prevent changes during animation

    setState(prev => ({
      ...prev,
      questStates: {
        ...prev.questStates,
        [questKey]: newState
      }
    }));
  }, [state.isAnimating]);

  const setHeaderState = useCallback((newState: HeaderState) => {
    if (state.isAnimating) return;
    setState(prev => ({ ...prev, headerState: newState }));
  }, [state.isAnimating]);

  const setRewardsState = useCallback((newState: RewardsState) => {
    if (state.isAnimating) return;
    setState(prev => ({ ...prev, rewardsState: newState }));
  }, [state.isAnimating]);

  const setButtonState = useCallback((newState: ButtonState) => {
    if (state.isAnimating) return;
    setState(prev => ({ ...prev, buttonState: newState }));
  }, [state.isAnimating]);

  // Animation control
  const startAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: true }));
  }, []);

  const finishAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const value: QuestlineContextValue = {
    state,
    questlineData,
    setQuestState,
    setHeaderState,
    setRewardsState,
    setButtonState,
    setCanvasScale: (scale) => setState(prev => ({ ...prev, canvasScale: scale })),
    selectQuest: (questKey) => setState(prev => ({ ...prev, selectedQuest: questKey })),
    setAllQuestsState: (newState) => {
      if (state.isAnimating || !questlineData) return;
      const newQuestStates = questlineData.quests.reduce((acc, quest) => {
        acc[quest.questKey] = newState;
        return acc;
      }, {} as Record<string, QuestState>);
      setState(prev => ({ ...prev, questStates: newQuestStates }));
    },
    resetAllStates: () => {
      if (state.isAnimating) return;
      setState(prev => ({
        ...prev,
        questStates: {},
        headerState: 'active',
        rewardsState: 'active',
        buttonState: 'default',
        selectedQuest: null
      }));
    },
    startAnimation,
    finishAnimation
  };

  return (
    <QuestlineContext.Provider value={value}>
      {children}
    </QuestlineContext.Provider>
  );
}
```

#### Click Handlers and Interactions

```typescript
// Quest click handler with state cycling
function useQuestInteraction() {
  const { state, setQuestState } = useQuestlineContext();

  const handleQuestClick = useCallback((questKey: string) => {
    const currentState = state.questStates[questKey] || 'locked';

    // Define state cycle: locked -> active -> unclaimed -> completed -> locked
    const stateMap: Record<QuestState, QuestState> = {
      'locked': 'active',
      'active': 'unclaimed',
      'unclaimed': 'completed',
      'completed': 'locked'
    };

    const nextState = stateMap[currentState];
    setQuestState(questKey, nextState);
  }, [state.questStates, setQuestState]);

  return { handleQuestClick };
}

// Header click handler with state cycling
function useHeaderInteraction() {
  const { state, setHeaderState } = useQuestlineContext();

  const handleHeaderClick = useCallback(() => {
    const stateMap: Record<HeaderState, HeaderState> = {
      'active': 'success',
      'success': 'fail',
      'fail': 'active'
    };

    const nextState = stateMap[state.headerState];
    setHeaderState(nextState);
  }, [state.headerState, setHeaderState]);

  return { handleHeaderClick };
}

// Button interaction with hover states
function useButtonInteraction() {
  const { state, setButtonState } = useQuestlineContext();

  const handleButtonMouseEnter = useCallback(() => {
    if (state.buttonState === 'default') {
      setButtonState('hover');
    }
  }, [state.buttonState, setButtonState]);

  const handleButtonMouseLeave = useCallback(() => {
    if (state.buttonState === 'hover') {
      setButtonState('default');
    }
  }, [state.buttonState, setButtonState]);

  const handleButtonMouseDown = useCallback(() => {
    setButtonState('active');
  }, [setButtonState]);

  const handleButtonMouseUp = useCallback(() => {
    setButtonState('hover');
  }, [setButtonState]);

  const handleButtonClick = useCallback(() => {
    // Cycle between default and disabled
    const nextState = state.buttonState === 'disabled' ? 'default' : 'disabled';
    setButtonState(nextState);
  }, [state.buttonState, setButtonState]);

  return {
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    handleButtonMouseDown,
    handleButtonMouseUp,
    handleButtonClick
  };
}
```

### Component Rendering Patterns

#### Quest Component Renderer

```typescript
interface QuestRendererProps {
  quest: Quest;
  currentState: QuestState;
  scale: number;
  onClick: (questKey: string) => void;
  isSelected: boolean;
}

function QuestRenderer({ quest, currentState, scale, onClick, isSelected }: QuestRendererProps) {
  const bounds = quest.stateBounds[currentState];
  const position = convertQuestPosition(bounds, scale);

  // Get the appropriate image for current state
  const imageMap: Record<QuestState, string> = {
    'locked': quest.lockedImg,
    'active': quest.activeImg,
    'unclaimed': quest.unclaimedImg,
    'completed': quest.completedImg
  };

  const imageSrc = imageMap[currentState];

  return (
    <div
      className={`quest-component ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        transform: `rotate(${bounds.rotation || 0}deg)`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: isSelected ? 1001 : 1000,
        border: isSelected ? '2px solid #007AFF' : 'none',
        borderRadius: '4px'
      }}
      onClick={() => onClick(quest.questKey)}
      title={`${quest.questKey} (${currentState})`}
    >
      <img
        src={imageSrc}
        alt={`${quest.questKey} ${currentState}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          // Fallback to colored rectangle if image fails
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.style.backgroundColor = getStateColor(currentState);
          target.parentElement!.textContent = quest.questKey;
        }}
      />
    </div>
  );
}

// Helper function for fallback colors
function getStateColor(state: QuestState): string {
  const colorMap: Record<QuestState, string> = {
    'locked': '#6B7280',
    'active': '#3B82F6',
    'unclaimed': '#F59E0B',
    'completed': '#10B981'
  };
  return colorMap[state];
}
```

#### Timer Component Renderer

```typescript
interface TimerRendererProps {
  timer: TimerComponent;
  scale: number;
}

function TimerRenderer({ timer, scale }: TimerRendererProps) {
  const position = convertTimerPosition(timer, scale);

  // Convert styling to CSS
  const backgroundStyle = convertFillToCSS(timer.backgroundFill);
  const shadowStyle = timer.dropShadows
    .map(shadow => `${shadow.x * scale}px ${shadow.y * scale}px ${shadow.blur * scale}px ${shadow.spread * scale}px ${shadow.color}`)
    .join(', ');

  const textStyle = timer.textStyle;

  return (
    <div
      className="timer-component"
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        borderRadius: timer.borderRadius * scale,
        background: backgroundStyle,
        boxShadow: shadowStyle,
        display: 'flex',
        alignItems: getVerticalAlignment(textStyle.textAlignVertical),
        justifyContent: getHorizontalAlignment(textStyle.textAlignHorizontal),
        padding: timer.isAutolayout ? 0 : `${timer.padding.vertical * scale}px ${timer.padding.horizontal * scale}px`,
        fontSize: textStyle.fontSize * scale,
        color: textStyle.color,
        fontWeight: textStyle.fontWeight || 600,
        zIndex: 1200
      }}
    >
      Timer: 2d 14h 32m
    </div>
  );
}

// Helper functions for alignment
function getVerticalAlignment(align?: string): string {
  switch (align) {
    case 'TOP': return 'flex-start';
    case 'BOTTOM': return 'flex-end';
    default: return 'center';
  }
}

function getHorizontalAlignment(align?: string): string {
  switch (align) {
    case 'LEFT': return 'flex-start';
    case 'RIGHT': return 'flex-end';
    default: return 'center';
  }
}
```

#### Button Component Renderer

```typescript
interface ButtonRendererProps {
  button: ButtonComponent;
  currentState: ButtonState;
  scale: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onClick: () => void;
}

function ButtonRenderer({
  button,
  currentState,
  scale,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onClick
}: ButtonRendererProps) {
  const stateStyle = button.stateStyles[currentState];
  if (!stateStyle) return null;

  // Calculate button dimensions (estimated from text + padding)
  const textLength = 8; // "Click me" example
  const estimatedTextWidth = stateStyle.text.fontSize * textLength * 0.6;
  const buttonWidth = estimatedTextWidth + (stateStyle.frame.padding.horizontal * 2);
  const buttonHeight = stateStyle.text.fontSize * 1.5 + (stateStyle.frame.padding.vertical * 2);

  const left = (button.position.x * scale) - (buttonWidth * scale / 2);
  const top = (button.position.y * scale) - (buttonHeight * scale / 2);

  // Convert styling to CSS
  const backgroundStyle = convertFillToCSS(stateStyle.frame.backgroundFill);
  const shadowStyle = stateStyle.frame.dropShadows
    ?.map(shadow => `${shadow.x * scale}px ${shadow.y * scale}px ${shadow.blur * scale}px ${shadow.spread * scale}px ${shadow.color}`)
    .join(', ') || 'none';

  const borderStyle = stateStyle.frame.stroke
    ? `${stateStyle.frame.stroke.width * scale}px solid ${stateStyle.frame.stroke.color}`
    : 'none';

  return (
    <button
      className="button-component"
      style={{
        position: 'absolute',
        left,
        top,
        width: buttonWidth * scale,
        height: buttonHeight * scale,
        borderRadius: stateStyle.frame.borderRadius * scale,
        background: backgroundStyle,
        border: borderStyle,
        boxShadow: shadowStyle,
        fontSize: stateStyle.text.fontSize * scale,
        color: stateStyle.text.color,
        fontWeight: stateStyle.text.fontWeight || 500,
        cursor: currentState === 'disabled' ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        zIndex: 1050,
        outline: 'none'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      disabled={currentState === 'disabled'}
    >
      Click me
    </button>
  );
}
```

## ZIP Parsing and Asset Loading

### ZIP File Processing

The exported questline ZIP files need to be parsed and validated before rendering.

#### ZIP Parser Implementation

```typescript
import JSZip from 'jszip';

interface ParsedQuestlineData {
  questlineData: QuestlineExport;
  assets: Map<string, string>;  // filename -> blob URL
  errors: string[];
}

class QuestlineZipParser {
  async parseZipFile(file: File): Promise<ParsedQuestlineData> {
    const errors: string[] = [];
    const assets = new Map<string, string>();

    try {
      const zip = await JSZip.loadAsync(file);

      // 1. Extract and parse positions.json
      const positionsFile = zip.file('positions.json');
      if (!positionsFile) {
        throw new Error('positions.json not found in ZIP file');
      }

      const positionsText = await positionsFile.async('text');
      const questlineData = JSON.parse(positionsText) as QuestlineExport;

      // 2. Validate questline data structure
      this.validateQuestlineData(questlineData, errors);

      // 3. Extract all image assets
      await this.extractAssets(zip, questlineData, assets, errors);

      return {
        questlineData,
        assets,
        errors
      };

    } catch (error) {
      errors.push(`Failed to parse ZIP file: ${error.message}`);
      throw new Error(`ZIP parsing failed: ${errors.join(', ')}`);
    }
  }

  private validateQuestlineData(data: QuestlineExport, errors: string[]): void {
    // Validate required fields
    if (!data.questlineId) errors.push('Missing questlineId');
    if (!data.frameSize?.width || !data.frameSize?.height) {
      errors.push('Invalid frameSize dimensions');
    }
    if (!data.background?.exportUrl) errors.push('Missing background reference');
    if (!Array.isArray(data.quests)) errors.push('Invalid quests array');

    // Validate quest structure
    data.quests?.forEach((quest, index) => {
      if (!quest.questKey) errors.push(`Quest ${index}: missing questKey`);
      if (!quest.stateBounds) errors.push(`Quest ${index}: missing stateBounds`);

      // Validate all required states
      const requiredStates: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];
      requiredStates.forEach(state => {
        if (!quest.stateBounds[state]) {
          errors.push(`Quest ${quest.questKey}: missing ${state} state bounds`);
        }
      });

      // Validate image references
      if (!quest.lockedImg) errors.push(`Quest ${quest.questKey}: missing lockedImg`);
      if (!quest.activeImg) errors.push(`Quest ${quest.questKey}: missing activeImg`);
      if (!quest.unclaimedImg) errors.push(`Quest ${quest.questKey}: missing unclaimedImg`);
      if (!quest.completedImg) errors.push(`Quest ${quest.questKey}: missing completedImg`);
    });

    // Validate optional components
    if (data.timer) {
      if (!data.timer.position || !data.timer.dimensions) {
        errors.push('Timer: invalid position or dimensions');
      }
    }

    if (data.header) {
      if (!data.header.stateBounds || !data.header.activeImg) {
        errors.push('Header: missing stateBounds or image references');
      }
    }

    if (data.button) {
      if (!data.button.position || !data.button.stateStyles) {
        errors.push('Button: missing position or stateStyles');
      }
    }
  }

  private async extractAssets(
    zip: JSZip,
    questlineData: QuestlineExport,
    assets: Map<string, string>,
    errors: string[]
  ): Promise<void> {
    const requiredAssets = new Set<string>();

    // Collect all required asset filenames
    requiredAssets.add(questlineData.background.exportUrl);

    questlineData.quests.forEach(quest => {
      requiredAssets.add(quest.lockedImg);
      requiredAssets.add(quest.activeImg);
      requiredAssets.add(quest.unclaimedImg);
      requiredAssets.add(quest.completedImg);
    });

    if (questlineData.header) {
      requiredAssets.add(questlineData.header.activeImg);
      requiredAssets.add(questlineData.header.successImg);
      requiredAssets.add(questlineData.header.failImg);
    }

    if (questlineData.rewards) {
      requiredAssets.add(questlineData.rewards.activeImg);
      requiredAssets.add(questlineData.rewards.failImg);
      requiredAssets.add(questlineData.rewards.claimedImg);
    }

    // Extract each required asset
    for (const filename of requiredAssets) {
      const file = zip.file(filename);
      if (!file) {
        errors.push(`Missing asset: ${filename}`);
        continue;
      }

      try {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);
        assets.set(filename, url);
      } catch (error) {
        errors.push(`Failed to extract ${filename}: ${error.message}`);
      }
    }
  }
}
```

### Asset Management

#### Asset Loader Service

```typescript
class AssetLoader {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  async loadImage(src: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Start new loading process
    const promise = this.createImageLoadPromise(src);
    this.loadingPromises.set(src, promise);

    try {
      const img = await promise;
      this.cache.set(src, img);
      return img;
    } finally {
      this.loadingPromises.delete(src);
    }
  }

  private createImageLoadPromise(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

      // Set timeout for loading
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.src = src;
    });
  }

  preloadAssets(assets: Map<string, string>): Promise<void[]> {
    const loadPromises = Array.from(assets.values()).map(url =>
      this.loadImage(url).catch(error => {
        console.warn(`Failed to preload asset: ${error.message}`);
        return null;
      })
    );

    return Promise.allSettled(loadPromises);
  }

  cleanup(): void {
    // Release object URLs to prevent memory leaks
    this.cache.forEach((img, src) => {
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    });

    this.cache.clear();
    this.loadingPromises.clear();
  }
}
```

#### React Hook for ZIP Loading

```typescript
interface UseZipLoaderResult {
  questlineData: QuestlineExport | null;
  assets: Map<string, string>;
  isLoading: boolean;
  error: string | null;
  loadZipFile: (file: File) => Promise<void>;
  clearData: () => void;
}

function useZipLoader(): UseZipLoaderResult {
  const [questlineData, setQuestlineData] = useState<QuestlineExport | null>(null);
  const [assets, setAssets] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parser = useRef(new QuestlineZipParser()).current;
  const assetLoader = useRef(new AssetLoader()).current;

  const loadZipFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parser.parseZipFile(file);

      if (result.errors.length > 0) {
        setError(`Validation warnings: ${result.errors.join(', ')}`);
      }

      // Preload assets
      await assetLoader.preloadAssets(result.assets);

      setQuestlineData(result.questlineData);
      setAssets(result.assets);

    } catch (error) {
      setError(error.message);
      setQuestlineData(null);
      setAssets(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [parser, assetLoader]);

  const clearData = useCallback(() => {
    assetLoader.cleanup();
    setQuestlineData(null);
    setAssets(new Map());
    setError(null);
  }, [assetLoader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      assetLoader.cleanup();
    };
  }, [assetLoader]);

  return {
    questlineData,
    assets,
    isLoading,
    error,
    loadZipFile,
    clearData
  };
}
```

## Utility Functions

### CSS Conversion Utilities

```typescript
// Convert Fill object to CSS background
function convertFillToCSS(fill: Fill): string {
  if (fill.type === 'solid') {
    return fill.color || 'transparent';
  }

  if (fill.type === 'gradient' && fill.gradient) {
    const { type, stops, rotation = 0 } = fill.gradient;

    const stopList = stops
      .map(stop => `${stop.color} ${Math.round(stop.position * 100)}%`)
      .join(', ');

    switch (type) {
      case 'linear':
        return `linear-gradient(${rotation}deg, ${stopList})`;
      case 'radial':
        return `radial-gradient(${stopList})`;
      case 'angular':
        return `conic-gradient(from ${rotation}deg, ${stopList})`;
      default:
        return 'transparent';
    }
  }

  return 'transparent';
}

// Convert hex color with opacity to CSS
function hexToCSS(hex: string): string {
  // Handle hex colors with alpha channel (#rrggbbaa)
  if (hex.length === 9) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return hex;
}

// Calculate responsive font size
function getResponsiveFontSize(baseFontSize: number, scale: number): number {
  const minSize = 8;
  const maxSize = 72;
  const scaledSize = Math.round(baseFontSize * scale);
  return Math.max(minSize, Math.min(maxSize, scaledSize));
}

// Generate CSS transform string
function generateTransform(rotation?: number, scale?: number): string {
  const transforms: string[] = [];

  if (rotation && rotation !== 0) {
    transforms.push(`rotate(${rotation}deg)`);
  }

  if (scale && scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  return transforms.length > 0 ? transforms.join(' ') : 'none';
}
```

### Performance Optimization

```typescript
// Debounced resize handler
function useDebounceResize(callback: () => void, delay: number = 250) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(callback, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay]);
}

// Virtualized rendering for large questlines
function useVirtualizedRendering(
  items: any[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);

  return {
    visibleItems,
    visibleStart,
    totalHeight: items.length * itemHeight,
    setScrollTop
  };
}

// Memory usage monitoring
function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(memory.usedJSHeapSize / memory.jsHeapSizeLimit);
      }
    };

    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}
```

## Complete Implementation Example

### Main Application Component

```typescript
import React from 'react';
import { QuestlineProvider } from './context/QuestlineContext';
import { ZipUploader } from './components/ZipUploader';
import { PreviewCanvas } from './components/PreviewCanvas';
import { StateControls } from './components/StateControls';
import { ScaleControls } from './components/ScaleControls';

function App() {
  return (
    <QuestlineProvider>
      <div className="app">
        <header className="app-header">
          <h1>Questline Preview</h1>
          <ZipUploader />
        </header>

        <main className="app-main">
          <div className="controls-panel">
            <StateControls />
            <ScaleControls />
          </div>

          <div className="preview-panel">
            <PreviewCanvas />
          </div>
        </main>
      </div>
    </QuestlineProvider>
  );
}

export default App;
```

### File Upload Component

```typescript
function ZipUploader() {
  const { loadZipFile, isLoading, error } = useZipLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/zip') {
      await loadZipFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/zip') {
      await loadZipFile(file);
    }
  };

  return (
    <div
      className="zip-uploader"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Upload ZIP File'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
```

This completes the comprehensive React Preview Project Guide! 🎉
```
```
```
```
```
