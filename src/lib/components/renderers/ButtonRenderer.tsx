import React from 'react';
import { ButtonState } from '../../types';
import { convertFillToCSS, convertShadowsToCSS } from '../../utils/utils';

/**
 * ButtonRenderer Component
 *
 * PURPOSE: Renders interactive button elements using imported theme styling data
 *
 * This component creates a fully functional button that responds to user interactions
 * (hover, active, disabled) using visual styles defined in the imported theme.
 * Each state (default, hover, active, disabled) has its own styling configuration
 * that gets applied dynamically based on user interaction.
 *
 * KEY CONCEPTS:
 * - Interactive Button States: Responds to user hover, click, and disabled states
 * - Theme-Based Styling: Uses imported theme data for all visual properties
 * - Center-Based Positioning: Positions from center point for natural UI placement
 * - Auto-Layout Support: Handles HUG, FILL, and FIXED layout modes from theme
 *
 * Integration for Real Apps:
 * - Replace getButtonText() with actual button labels from your data
 * - Connect onClick to actual functionality (API calls, navigation, etc.)
 * - Add proper accessibility features and keyboard navigation
 * - Extend with additional states as needed (loading, success, etc.)
 */

interface ButtonRendererProps {
  /** Button configuration from questline data including position, styling, and layout */
  button: any;
  /** Current visual state of the button (affects styling and behavior) */
  currentState: ButtonState;
  /** Scaling factor for responsive display across different screen sizes */
  scale: number;
  /** Handler for mouse enter events (triggers hover state in parent) */
  onMouseEnter: () => void;
  /** Handler for mouse leave events (returns to default state in parent) */
  onMouseLeave: () => void;
  /** Handler for button clicks (triggers actions in parent component) */
  onClick: () => void;
}

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({
  button,
  currentState,
  scale,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================

  if (!button) return null;

  const stateStyle = button.stateStyles[currentState];
  if (!stateStyle) return null;

  // ============================================================================
  // LAYOUT MODE DETECTION
  // ============================================================================

  /**
   * LAYOUT CONCEPTS:
   * - Auto-layout: Dynamic sizing based on content and constraints
   * - Fixed layout: Explicit width/height dimensions
   *
   * WHY THIS MATTERS:
   * Different layout modes require different CSS approaches for proper scaling
   */
  const isAutolayout = stateStyle.frame.isAutolayout;
  const layoutSizing = stateStyle.frame.layoutSizing;

  // ============================================================================
  // CSS VARIABLES GENERATION
  // ============================================================================

  /**
   * POSITIONING STRATEGY: Center-Based Coordinates
   *
   * Unlike quests (top-left) or headers (centerX, bottomY), buttons use center positioning:
   * - button.position.x/y represent the center point of the button
   * - CSS left/top set the element to that exact position
   * - CSS transform: translate(-50%, -50%) centers the element on that point
   * - This creates natural button placement for UI design and works with all layout modes
   *
   * DEVELOPER INTEGRATION:
   * When adapting to your database, ensure button coordinates represent center points
   */
  const cssVariables: Record<string, string> = {
    // Position: Center-based coordinates with transform centering
    '--button-left': `${button.position.x * scale}px`,
    '--button-top': `${button.position.y * scale}px`,
    '--button-transform': 'translate(-50%, -50%)',

    // Visual styling from state configuration
    '--button-bg': convertFillToCSS(stateStyle.frame.backgroundFill),
    '--button-border-radius': `${stateStyle.frame.borderRadius * scale}px`,
    '--button-box-shadow': convertShadowsToCSS(stateStyle.frame.dropShadows, scale),
    '--button-border': stateStyle.frame.stroke
      ? `${stateStyle.frame.stroke.width * scale}px solid ${stateStyle.frame.stroke.color}`
      : 'none',

    // Typography styling
    '--button-font-size': `${stateStyle.text.fontSize * scale}px`,
    '--button-color': stateStyle.text.color,

    // Padding (varies by layout mode)
    '--button-padding': isAutolayout
      ? `${stateStyle.frame.padding.vertical * scale}px ${stateStyle.frame.padding.horizontal * scale}px`
      : '0'
  };

  // ============================================================================
  // DIMENSION HANDLING (Layout Mode Specific)
  // ============================================================================

  /**
   * LAYOUT SIZING CONCEPTS:
   *
   * AUTO-LAYOUT MODES:
   * - HUG: Size to content + padding (responsive width/height)
   * - FILL: Expand to fill available space
   * - FIXED: Use specific dimensions from design
   *
   * DEVELOPER LEARNING:
   * This pattern shows how to handle different UI sizing strategies
   * Adapt these concepts to your own responsive button system
   */
  if (isAutolayout) {
    // Auto-layout mode: Dynamic sizing based on content and constraints
    if (layoutSizing) {
      // Horizontal sizing strategy
      if (layoutSizing.horizontal === "HUG") {
        // HUG: Width determined by content + padding (no explicit width)
        // This creates responsive buttons that grow/shrink with text length
      } else if (layoutSizing.horizontal === "FILL") {
        // FILL: Button expands to fill available container width
        cssVariables['--button-width'] = '100%';
      } else {
        // FIXED: Use explicit width from design specifications
        cssVariables['--button-width'] = `${stateStyle.frame.dimensions?.width * scale || 160 * scale}px`;
      }

      // Vertical sizing strategy
      if (layoutSizing.vertical === "HUG") {
        // HUG: Height determined by content + padding (no explicit height)
        // Creates buttons that adapt to text size and padding
      } else if (layoutSizing.vertical === "FILL") {
        // FILL: Button expands to fill available container height
        cssVariables['--button-height'] = '100%';
      } else {
        // FIXED: Use explicit height from design specifications
        cssVariables['--button-height'] = `${stateStyle.frame.dimensions?.height * scale || 60 * scale}px`;
      }
    }
    // If layoutSizing is undefined, default to HUG behavior (content-based sizing)
  } else {
    // Fixed layout mode: Use explicit dimensions from design
    cssVariables['--button-width'] = `${stateStyle.frame.dimensions?.width * scale || 160 * scale}px`;
    cssVariables['--button-height'] = `${stateStyle.frame.dimensions?.height * scale || 60 * scale}px`;
  }

  // ============================================================================
  // BUTTON TEXT GENERATION
  // ============================================================================

  /**
   * DEMO TEXT GENERATION:
   * This function provides demo text for different button states
   *
   * PRODUCTION INTEGRATION:
   * Replace this with actual button text from your data:
   * - Database field: button.text or button.label
   * - Localization: t(button.textKey)
   * - Dynamic content: `Claim ${rewardAmount} Gold`
   */
  const getButtonText = (state: ButtonState): string => {
    const textMap: Record<ButtonState, string> = {
      'default': 'CLICK ME',
      'hover': 'HOVERING',
      'active': 'PRESSED',
      'disabled': 'DISABLED'
    };
    return textMap[state] || 'BUTTON';
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <button
      className="button-component"
      data-button-state={currentState}
      style={cssVariables}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      disabled={currentState === 'disabled'}
      title={`Button Component (${currentState.toUpperCase()})`}
      aria-label={`${getButtonText(currentState)} button`}
    >
      {getButtonText(currentState)}
    </button>
  );
};
