import React from 'react';
import { convertFillToCSS, convertShadowsToCSS } from '../../utils/utils';

/**
 * TimerRenderer Component
 *
 * PURPOSE: Displays timer components from theme ZIP files
 *
 * This component renders timer components extracted from theme ZIP files.
 * Timers display static time content (05:42) with comprehensive styling
 * including backgrounds, shadows, typography, and auto-layout support.
 *
 * What this does:
 * - Displays static timer content with proper styling
 * - Positions using x,y coordinates from ZIP data (center positioning)
 * - Supports auto-layout modes: HUG, FILL, and FIXED sizing
 * - Scales all dimensions and styling based on provided scale factor
 */

interface TimerRendererProps {
  /** Timer data from ZIP file including position, dimensions, and styling */
  timer: any;
  /** Scale factor for responsive sizing */
  scale: number;
}

export const TimerRenderer: React.FC<TimerRendererProps> = ({ timer, scale }) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!timer) return null;

  // ============================================================================
  // LAYOUT MODE DETECTION
  // ============================================================================

  /**
   * Determine styling approach based on auto-layout configuration
   */
  const isAutolayout = timer.isAutolayout;
  const layoutSizing = timer.layoutSizing;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * Create CSS positioning and styling variables
   * Timers use x,y coordinates from ZIP data (center positioning)
   *
   * POSITIONING STRATEGY: Center-based coordinates with CSS transform
   * - timer.position.x/y represent the center point of the timer
   * - CSS left/top set the element to that exact position
   * - CSS transform: translate(-50%, -50%) centers the element on that point
   * - This works regardless of whether the element uses HUG, FILL, or FIXED sizing
   */
  const cssVariables: Record<string, string> = {
    // Position: Center-based coordinates with transform centering
    '--timer-left': `${timer.position.x * scale}px`,
    '--timer-top': `${timer.position.y * scale}px`,
    '--timer-transform': 'translate(-50%, -50%)',

    // Styling variables
    '--timer-bg': convertFillToCSS(timer.backgroundFill),
    '--timer-border-radius': `${timer.borderRadius * scale}px`,
    '--timer-box-shadow': convertShadowsToCSS(timer.dropShadows, scale),
    '--timer-font-size': `${timer.textStyle.fontSize * scale}px`,
    '--timer-color': timer.textStyle.color,
    '--timer-font-weight': `${timer.textStyle.fontWeight || 600}`,
    '--timer-text-align': timer.textStyle.textAlignHorizontal?.toLowerCase() || 'center',
    '--timer-padding': isAutolayout
      ? `${timer.padding.vertical * scale}px ${timer.padding.horizontal * scale}px`
      : '0'
  };

  // ============================================================================
  // DIMENSION CALCULATION
  // ============================================================================

  /**
   * Handle sizing based on auto-layout mode
   * With transform: translate(-50%, -50%), we only need to set dimensions for specific layout modes
   *
   * LAYOUT MODES:
   * - HUG: No width/height needed - size determined by content + padding
   * - FILL: Set width/height to 100% to fill container
   * - FIXED: Set explicit dimensions from design
   */
  if (isAutolayout && layoutSizing) {
    // Handle horizontal sizing
    if (layoutSizing.horizontal === "FILL") {
      cssVariables['--timer-width'] = '100%';
    } else if (layoutSizing.horizontal === "FIXED") {
      cssVariables['--timer-width'] = `${timer.dimensions.width * scale}px`;
    }
    // HUG mode: Don't set width - let content determine size

    // Handle vertical sizing
    if (layoutSizing.vertical === "FILL") {
      cssVariables['--timer-height'] = '100%';
    } else if (layoutSizing.vertical === "FIXED") {
      cssVariables['--timer-height'] = `${timer.dimensions.height * scale}px`;
    }
    // HUG mode: Don't set height - let content determine size
  } else if (!isAutolayout) {
    // Fixed layout mode: Always use explicit dimensions
    cssVariables['--timer-width'] = `${timer.dimensions.width * scale}px`;
    cssVariables['--timer-height'] = `${timer.dimensions.height * scale}px`;
  }
  // If isAutolayout is true but layoutSizing is undefined, default to HUG behavior (no explicit dimensions)

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      className="timer-component"
      style={cssVariables}
      title="Timer Component"
      role="timer"
      aria-label="Timer display showing 05:42"
    >
      05:42
    </div>
  );
};
