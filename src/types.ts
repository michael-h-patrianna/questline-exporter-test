// Core types for the new questline format

// Component state types
export type QuestState = 'locked' | 'active' | 'unclaimed' | 'completed';
export type HeaderState = 'active' | 'success' | 'fail';
export type RewardsState = 'active' | 'fail' | 'claimed' | 'unclaimed';
export type ButtonState = 'default' | 'disabled' | 'hover' | 'active';

// Fill and styling types
export interface Fill {
  type: 'solid' | 'gradient';
  color?: string;
  gradient?: Gradient;
}

export interface Gradient {
  type: 'linear' | 'radial' | 'angular';
  stops: GradientStop[];
  rotation?: number;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface DropShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export interface Stroke {
  width: number;
  color: string;
}

// Quest component with state-based bounds
export interface Quest {
  questKey: string;
  stateBounds: {
    locked: ImageBounds;
    active: ImageBounds;
    unclaimed: ImageBounds;
    completed: ImageBounds;
  };
  lockedImg?: string;
  activeImg?: string;
  unclaimedImg?: string;
  completedImg?: string;
}

// Base interface for image-based component positioning
export interface ImageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

// Timer component
export interface TimerComponent {
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  borderRadius: number;
  backgroundFill: Fill;
  isAutolayout: boolean;
  layoutSizing?: {
    horizontal: string;
    vertical: string;
  };
  padding: {
    vertical: number;
    horizontal: number;
  };
  dropShadows: DropShadow[];
  textStyle: {
    fontSize: number;
    color: string;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
}

// Header component
export interface HeaderComponent {
  stateBounds: {
    active: ImageBounds;
    success: ImageBounds;
    fail: ImageBounds;
  };
  activeImg: string;
  successImg: string;
  failImg: string;
}

// Rewards component
export interface RewardsComponent {
  stateBounds: {
    active: ImageBounds;
    fail: ImageBounds;
    claimed: ImageBounds;
    unclaimed: ImageBounds;
  };
  activeImg: string;
  failImg: string;
  claimedImg: string;
  unclaimedImg: string;
}

// Button component
export interface ButtonComponent {
  position: {
    x: number;
    y: number;
  };
  stateStyles: {
    default: ButtonStateStyle;
    disabled: ButtonStateStyle;
    hover: ButtonStateStyle;
    active: ButtonStateStyle;
  };
}

export interface ButtonStateStyle {
  frame: {
    borderRadius: number;
    backgroundFill: Fill;
    isAutolayout: boolean;
    layoutSizing?: {
      horizontal: string;
      vertical: string;
    };
    padding: {
      vertical: number;
      horizontal: number;
    };
    dropShadows: DropShadow[];
    stroke?: Stroke;
  };
  text: {
    fontSize: number;
    color: string;
  };
}

// Main questline export format
export interface QuestlineExport {
  questlineId: string;
  frameSize: {
    width: number;
    height: number;
  };
  background: {
    exportUrl: string;
  };
  quests: Quest[];
  timer?: TimerComponent;
  header?: HeaderComponent;
  rewards?: RewardsComponent;
  button?: ButtonComponent;
  exportedAt: string;
  metadata: {
    totalQuests: number;
    exportFormat?: string;
    version: string;
  };
}

// Application state management
export interface AppState {
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;
  isAnimating: boolean;
}

// Extracted assets from ZIP
export interface ExtractedAssets {
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
    unclaimed?: string;
  };
}
