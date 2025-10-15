/**
 * QuestRenderer Component
 *
 * PURPOSE: Displays quest images from theme ZIP files
 *
 * This component renders quest images extracted from theme ZIP files.
 * Users can click to cycle through different visual states to preview
 * how the quest looks in each state.
 *
 * What this does:
 * - Displays quest image for current visual state
 * - Clicking cycles through: locked → active → unclaimed → completed → locked
 * - Positions using x,y coordinates from ZIP data
 * - Scales image based on provided scale factor
 */

import React from 'react';
import { Quest, QuestState } from '../../types';

interface QuestRendererProps {
  /** Quest data from ZIP file including bounds for each state */
  quest: Quest;
  /** Current visual state being displayed */
  currentState: QuestState;
  /** Scale factor for responsive sizing */
  scale: number;
  /** Quest image URL for current state */
  questImage?: string;
  /** Whether to show quest key overlay for debugging */
  showQuestKeys?: boolean;
  /** Function called when user clicks to cycle to next state */
  onCycleState: (questKey: string) => void;
}

export const QuestRenderer: React.FC<QuestRendererProps> = ({
  quest,
  currentState,
  scale,
  questImage,
  showQuestKeys = false,
  onCycleState
}) => {

  // ============================================================================
  // DATA VALIDATION & SAFETY
  // ============================================================================

  /**
   * Validate quest data from ZIP file
   */
  if (!quest?.questKey || !quest?.stateBounds) {
    console.warn('QuestRenderer: Invalid quest data', { quest, currentState });
    return null;
  }

  /**
   * Get positioning data for current state
   */
  const bounds = quest.stateBounds[currentState];

  if (!bounds) {
    console.warn(`QuestRenderer: Missing bounds for state "${currentState}"`, { quest });
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
   * Quests use x,y coordinates from ZIP data (center positioning)
   */
  const cssVariables: Record<string, string> = {
    // Position: x,y - convert to top-left for CSS
    '--quest-left': `${(bounds.x * scale) - (width / 2)}px`,
    '--quest-top': `${(bounds.y * scale) - (height / 2)}px`,

    // Scaled dimensions
    '--quest-width': `${width}px`,
    '--quest-height': `${height}px`,

    // Optional rotation
    '--quest-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none'
  };

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Handle click to cycle to next visual state
   */
  const handleClick = () => {
    onCycleState(quest.questKey);
  };

  /**
   * Handle keyboard interaction for accessibility
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div
      key={quest.questKey}
      className="quest-component"
      data-quest-key={quest.questKey}
      data-quest-state={currentState}
      role="button"
      tabIndex={0}
      aria-label={`Quest ${quest.questKey} - ${currentState} visual state`}
      style={cssVariables}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`${quest.questKey} (${currentState}) - Click to cycle states`}
    >
      {/* Display quest image for current state */}
      <img
        src={questImage}
        alt={`${quest.questKey} in ${currentState} visual state`}
        className="quest-image"
        draggable={false}
      />

      {/* Optional quest key overlay for debugging */}
      {showQuestKeys && (
        <div className="quest-key-overlay">
          {quest.questKey}
        </div>
      )}
    </div>
  );
};
