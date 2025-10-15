/**
 * RewardsRenderer Component
 *
 * PURPOSE: Displays rewards images from theme ZIP files
 *
 * This component renders rewards images extracted from theme ZIP files.
 * Users can click to cycle through different visual states to preview
 * how the rewards look in each state.
 *
 * What this does:
 * - Displays rewards image for current visual state
 * - Clicking cycles through: active → fail → claimed → active
 * - Positions using x,y coordinates from ZIP data
 * - Scales image based on provided scale factor
 */

import React from 'react';
import { RewardsState } from '../../types';

interface RewardsRendererProps {
  /** Rewards data from ZIP file including bounds for each state */
  rewards: any;
  /** Current visual state being displayed */
  currentState: RewardsState;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Rewards image URL for current state */
  rewardsImage?: string;
  /** Function called when user clicks to cycle to next state */
  onCycleState: () => void;
}

export const RewardsRenderer: React.FC<RewardsRendererProps> = ({
  rewards,
  currentState,
  scale,
  rewardsImage,
  onCycleState
}) => {

  // ============================================================================
  // DATA VALIDATION & SAFETY
  // ============================================================================

  /**
   * Validate rewards data from ZIP file
   */
  if (!rewards) {
    console.warn('RewardsRenderer: No rewards data provided');
    return null;
  }

  /**
   * Get positioning data for current state
   */
  const bounds = rewards.stateBounds[currentState];

  if (!bounds) {
    console.warn(`RewardsRenderer: Missing bounds for state "${currentState}"`, { rewards });
    return null;
  }

  // ============================================================================
  // DIMENSION & POSITION CALCULATIONS
  // ============================================================================

  /**
   * Calculate scaled dimensions directly from bounds
   * All scaling happens here for clarity in this demo
   */
  const width = bounds.width * scale;
  const height = bounds.height * scale;

  /**
   * Create CSS positioning variables
   * Rewards use x,y coordinates from ZIP data (center positioning)
   */
  const cssVariables: Record<string, string> = {
    // Position: x,y - convert to top-left for CSS
    '--rewards-left': `${(bounds.x * scale) - (width / 2)}px`,
    '--rewards-top': `${(bounds.y * scale) - (height / 2)}px`,

    // Scaled dimensions
    '--rewards-width': `${width}px`,
    '--rewards-height': `${height}px`,

    // Optional rotation
    '--rewards-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none'
  };

  // ============================================================================
  // REWARDS STATE LOGIC & EVENT HANDLING
  // ============================================================================

  /**
   * Handle click to cycle to next visual state
   */
  const handleRewardsClick = () => {
    onCycleState();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="rewards-component"
      data-rewards-state={currentState}
      style={cssVariables}
      onClick={handleRewardsClick}
      title={`Rewards Component (${currentState}) - Click to cycle through visual states`}
      role="button"
      tabIndex={0}
      aria-label={`Rewards in ${currentState} visual state - click to cycle states`}
    >
      {/* Display rewards image for current state */}
      <img
        src={rewardsImage}
        alt={`Rewards in ${currentState} visual state`}
        className="rewards-image"
        draggable={false}
      />
    </div>
  );
};
