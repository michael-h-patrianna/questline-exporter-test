/**
 * QuestlineViewer - Main Questline Display Component
 *
 * This component serves as the primary coordinator for displaying questline content.
 * It handles the overall layout, scaling, and orchestrates the rendering of all
 * questline components (quests, timer, header, rewards, button).
 *
 * Key Responsibilities:
 * - Calculate responsive scaling for questline display
 * - Coordinate component rendering using specialized renderer components
 * - Provide container structure and background rendering
 * - Handle component bounds calculation for overflow management
 *
 * Architecture Pattern:
 * This component follows a "coordinator pattern" where it manages layout and
 * delegates specific rendering responsibilities to specialized renderer components.
 * State management is handled by the useQuestlineState hook to maintain separation
 * of concerns.
 *
 * Usage:
 * The QuestlineViewer is designed to be a standalone, reusable component that can
 * be integrated into any React application. It handles all internal questline
 * logic while providing callback props for external integration.
 */

import React from 'react';
import { ExtractedAssets, QuestlineExport } from '../types';
import './QuestlineViewer.css';

// Import specialized renderer components
import { ButtonRenderer } from './renderers/ButtonRenderer';
import { HeaderRenderer } from './renderers/HeaderRenderer';
import { QuestRenderer } from './renderers/QuestRenderer';
import { RewardsRenderer } from './renderers/RewardsRenderer';
import { TimerRenderer } from './renderers/TimerRenderer';

// Import separated concerns
import { useQuestlineState } from '../hooks/useQuestlineState';
import {
  calculateQuestlineContentBounds,
  calculateQuestlineScale
} from '../utils/utils';

/**
 * QuestlineViewer Props Interface
 *
 * Defines the external API for the QuestlineViewer component.
 * This interface represents what external applications need to provide
 * to integrate questline display functionality.
 */
interface QuestlineViewerProps {
  /** Questline export data from Figma plugin */
  questlineData: QuestlineExport;

  /** Extracted assets including images and background */
  assets: ExtractedAssets;

  /** Target display width for the questline */
  questlineWidth: number;

  /** Target display height for the questline */
  questlineHeight: number;

  /** Whether to show quest key overlays for debugging/development */
  showQuestKeys?: boolean;

  /** Callback function executed when questline button is clicked */
  onButtonClick?: () => void;
}

/**
 * QuestlineViewer - Main Questline Display Component
 *
 * This component coordinates the display of an entire questline, including
 * all interactive components. It uses the useQuestlineState hook for state
 * management and specialized renderer components for display logic.
 */
export const QuestlineViewer: React.FC<QuestlineViewerProps> = ({
  questlineData,
  assets,
  questlineWidth,
  questlineHeight,
  showQuestKeys = false,
  onButtonClick
}) => {

  // ============================================================================
  // STATE MANAGEMENT (Delegated to Hook)
  // ============================================================================

  /**
   * All questline state management is handled by the useQuestlineState hook.
   * This separation allows developers to easily understand and modify state
   * behavior without touching rendering logic.
   */
  const {
    questStates,
    headerState,
    rewardsState,
    buttonState,
    cycleQuestState,
    cycleHeaderState,
    cycleRewardsState,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    handleButtonClick
  } = useQuestlineState(questlineData);

  // ============================================================================
  // LAYOUT & SCALING CALCULATIONS (Delegated to Transform Utils)
  // ============================================================================

  /**
   * Calculate responsive scaling for the questline display.
   * This ensures the questline maintains proper aspect ratios while fitting
   * within the requested display dimensions.
   */
  const originalSize = {
    width: questlineData.frameSize?.width || 800,
    height: questlineData.frameSize?.height || 600
  };

  const targetSize = {
    width: questlineWidth,
    height: questlineHeight
  };

  const { scale, scaledWidth, scaledHeight } = calculateQuestlineScale(originalSize, targetSize);

  /**
   * Calculate content bounds to handle components that might extend beyond
   * the original frame boundaries. This is important for proper overflow
   * handling and scroll area calculations.
   */
  const contentBounds = calculateQuestlineContentBounds(
    questlineData,
    questStates,
    headerState,
    rewardsState,
    scale
  );

  // ============================================================================
  // COMPONENT RENDERING FUNCTIONS
  // ============================================================================

  /**
   * Render Quest Components
   *
   * Iterates through all quests and renders them using the QuestRenderer.
   * Each quest maintains its own state and handles its own click interactions.
   */
  const renderQuests = () => {
    if (!Array.isArray(questlineData?.quests)) return null;

    return questlineData.quests.map((quest) => {
      // Skip invalid quests
      if (!quest?.questKey || !quest?.stateBounds) return null;

      const currentState = questStates[quest.questKey] || 'locked';
      const questImage = assets?.questImages?.[quest.questKey]?.[currentState];

      return (
        <QuestRenderer
          key={quest.questKey}
          quest={quest}
          currentState={currentState}
          scale={scale}
          questImage={questImage}
          showQuestKeys={showQuestKeys}
          onCycleState={cycleQuestState}
        />
      );
    });
  };

  /**
   * Render Timer Component
   *
   * Displays the questline timer if present in the questline data.
   * Timer rendering uses the TimerRenderer for consistent styling.
   */
  const renderTimer = () => {
    if (!questlineData.timer) return null;

    return (
      <TimerRenderer
        timer={questlineData.timer}
        scale={scale}
      />
    );
  };

  /**
   * Render Header Component
   *
   * Displays the questline header with state-based image selection.
   * Header states cycle through active -> success -> fail.
   */
  const renderHeader = () => {
    if (!questlineData.header) return null;

    const headerImage = assets?.headerImages?.[headerState];

    return (
      <HeaderRenderer
        header={questlineData.header}
        currentState={headerState}
        scale={scale}
        headerImage={headerImage}
        onCycleState={cycleHeaderState}
      />
    );
  };

  /**
   * Render Rewards Component
   *
   * Displays the questline rewards with state-based image selection.
   * Rewards states cycle through active -> fail -> claimed.
   */
  const renderRewards = () => {
    if (!questlineData.rewards) return null;

    const rewardsImage = assets?.rewardsImages?.[rewardsState];

    return (
      <RewardsRenderer
        rewards={questlineData.rewards}
        currentState={rewardsState}
        scale={scale}
        rewardsImage={rewardsImage}
        onCycleState={cycleRewardsState}
      />
    );
  };

  /**
   * Render Button Component
   *
   * Displays the interactive questline button with hover and click states.
   * Button interactions are handled through the state management hook.
   */
  const renderButton = () => {
    if (!questlineData.button) return null;

    return (
      <ButtonRenderer
        button={questlineData.button}
        currentState={buttonState}
        scale={scale}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        onClick={() => handleButtonClick(onButtonClick)}
      />
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================


  return (
    <div
      className="questline-container-wrapper"
      role="region"
      aria-label="Questline game interface"
    >
      <div
        className="questline-viewer questline-canvas"
        role="img"
        aria-label="Interactive questline with clickable quests and components"
        style={{
          '--questline-width': `${scaledWidth}px`,
          '--questline-height': `${scaledHeight}px`,
          '--content-bounds-left': `${contentBounds.minX}px`,
          '--content-bounds-top': `${contentBounds.minY}px`,
          '--content-bounds-width': `${contentBounds.width}px`,
          '--content-bounds-height': `${contentBounds.height}px`
        } as React.CSSProperties}
      >

        {/* Content bounds indicator for debugging/development */}
        <div className="content-bounds-indicator" />

        {/* Background image rendering */}
        {assets.backgroundImage && (
          <div className="questline-background">
            <img
              src={assets.backgroundImage}
              alt="Questline background"
              className="questline-background-image"
              draggable={false}
            />
          </div>
        )}

        {/* Render all questline components in layered order */}
        {renderTimer()}
        {renderHeader()}
        {renderRewards()}
        {renderQuests()}
        {renderButton()}

      </div>
    </div>
  );
};
