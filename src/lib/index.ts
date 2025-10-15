/**
 * Questline Component Library
 *
 * Production-ready components for rendering themed questline games.
 * These components are designed to work with themes exported from the
 * Figma Questline Plugin.
 *
 * @packageDocumentation
 */

// Main Components
export { QuestlineViewer } from './components/QuestlineViewer';

// Renderer Components (for advanced customization)
export { ButtonRenderer } from './components/renderers/ButtonRenderer';
export { HeaderRenderer } from './components/renderers/HeaderRenderer';
export { QuestRenderer } from './components/renderers/QuestRenderer';
export { RewardsRenderer } from './components/renderers/RewardsRenderer';
export { TimerRenderer } from './components/renderers/TimerRenderer';

// Hooks
export { QuestlineProvider, useQuestlineContext } from './hooks/QuestlineContext';
export { useQuestlineState } from './hooks/useQuestlineState';

// Utility Functions
export { calculateQuestlineContentBounds, calculateQuestlineScale } from './utils/utils';
export { extractQuestlineZip } from './utils/zipExtractor';

// Type Definitions
export type {
  ButtonComponent,
  ButtonState,
  ExtractedAssets,
  HeaderComponent,
  HeaderState,
  Quest,
  QuestState,
  QuestlineExport,
  RewardsComponent,
  RewardsState,
  TimerComponent,
} from './types';
