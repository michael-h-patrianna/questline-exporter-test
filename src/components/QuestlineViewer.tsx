import React, { useCallback, useState } from 'react';
import { ButtonState, ExtractedAssets, HeaderState, QuestlineExport, QuestState, RewardsState } from '../types';
import './QuestlineViewer.css';
import { ButtonRenderer } from './renderers/ButtonRenderer';
import { HeaderRenderer } from './renderers/HeaderRenderer';
import { QuestRenderer } from './renderers/QuestRenderer';
import { RewardsRenderer } from './renderers/RewardsRenderer';
import { TimerRenderer } from './renderers/TimerRenderer';

interface QuestlineViewerProps {
  questlineData: QuestlineExport;
  assets: ExtractedAssets;
  questlineWidth: number;
  questlineHeight: number;
  showQuestKeys?: boolean;
  onButtonClick?: () => void;
}

interface ComponentState {
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;
}

export const QuestlineViewer: React.FC<QuestlineViewerProps> = ({
  questlineData,
  assets,
  questlineWidth,
  questlineHeight,
  showQuestKeys = false,
  onButtonClick
}) => {
  // Initialize state with error handling
  const [componentState, setComponentState] = useState<ComponentState>(() => {
    // Safely handle malformed questline data
    const validQuests = Array.isArray(questlineData?.quests) ? questlineData.quests : [];

    return {
      questStates: validQuests.reduce((acc, quest) => {
        if (quest?.questKey) {
          acc[quest.questKey] = 'locked';
        }
        return acc;
      }, {} as Record<string, QuestState>),
      headerState: 'active',
      rewardsState: 'active',
      buttonState: 'default'
    };
  });

  // Get original frame dimensions from questline data
  const originalWidth = questlineData.frameSize?.width || 800;
  const originalHeight = questlineData.frameSize?.height || 600;

  // Calculate scale based on desired questline size vs original size
  const scaleX = questlineWidth / originalWidth;
  const scaleY = questlineHeight / originalHeight;

  // Use uniform scaling to maintain aspect ratio (take the smaller scale)
  const scale = Math.min(scaleX, scaleY);

  // Calculate actual scaled dimensions (may be smaller than requested to maintain aspect ratio)
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;

  // Calculate content bounds including overflow
  const calculateContentBounds = () => {
    let minX = 0, minY = 0, maxX = originalWidth, maxY = originalHeight;

    // Check quest bounds
    if (Array.isArray(questlineData?.quests)) {
      questlineData.quests.forEach(quest => {
        if (quest?.stateBounds) {
          Object.values(quest.stateBounds).forEach(bounds => {
            if (bounds) {
              minX = Math.min(minX, bounds.x);
              minY = Math.min(minY, bounds.y);
              maxX = Math.max(maxX, bounds.x + bounds.w);
              maxY = Math.max(maxY, bounds.y + bounds.h);
            }
          });
        }
      });
    }

    // Check timer bounds
    if (questlineData.timer) {
      const timer = questlineData.timer;
      const width = timer.dimensions.width;
      const height = timer.dimensions.height;
      const left = timer.position.x - (width / 2);
      const top = timer.position.y - (height / 2);

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    }

    // Check header bounds
    if (questlineData.header) {
      Object.values(questlineData.header.stateBounds).forEach(bounds => {
        if (bounds) {
          const width = bounds.width;
          const height = bounds.height;
          const left = bounds.centerX - (width / 2);
          const top = bounds.bottomY - height;

          minX = Math.min(minX, left);
          minY = Math.min(minY, top);
          maxX = Math.max(maxX, left + width);
          maxY = Math.max(maxY, top + height);
        }
      });
    }

    // Check rewards bounds
    if (questlineData.rewards) {
      Object.values(questlineData.rewards.stateBounds).forEach(bounds => {
        if (bounds) {
          const width = bounds.width;
          const height = bounds.height;
          const left = bounds.centerX - (width / 2);
          const top = bounds.centerY - (height / 2);

          minX = Math.min(minX, left);
          minY = Math.min(minY, top);
          maxX = Math.max(maxX, left + width);
          maxY = Math.max(maxY, top + height);
        }
      });
    }

    // Check button bounds
    if (questlineData.button) {
      const width = 160; // estimated button width
      const height = 60; // estimated button height
      const left = questlineData.button.position.x - (width / 2);
      const top = questlineData.button.position.y - (height / 2);

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    }

    // Scale the bounds to match the display scale
    return {
      minX: minX * scale,
      minY: minY * scale,
      maxX: maxX * scale,
      maxY: maxY * scale,
      width: (maxX - minX) * scale,
      height: (maxY - minY) * scale
    };
  };  const contentBounds = calculateContentBounds();

  // Quest state cycling
  const cycleQuestState = useCallback((questKey: string) => {
    const currentState = componentState.questStates[questKey] || 'locked';
    const stateOrder: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];
    const currentIndex = stateOrder.indexOf(currentState);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    setComponentState(prev => ({
      ...prev,
      questStates: {
        ...prev.questStates,
        [questKey]: nextState
      }
    }));
  }, [componentState.questStates]);

  // Header state cycling
  const cycleHeaderState = useCallback(() => {
    const stateOrder: HeaderState[] = ['active', 'success', 'fail'];
    const currentIndex = stateOrder.indexOf(componentState.headerState);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    setComponentState(prev => ({ ...prev, headerState: nextState }));
  }, [componentState.headerState]);

  // Rewards state cycling
  const cycleRewardsState = useCallback(() => {
    const stateOrder: RewardsState[] = ['active', 'fail', 'claimed'];
    const currentIndex = stateOrder.indexOf(componentState.rewardsState);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    setComponentState(prev => ({ ...prev, rewardsState: nextState }));
  }, [componentState.rewardsState]);

  // Button handlers
  const handleButtonMouseEnter = () => {
    if (componentState.buttonState === 'default') {
      setComponentState(prev => ({ ...prev, buttonState: 'hover' }));
    }
  };

  const handleButtonMouseLeave = () => {
    if (componentState.buttonState === 'hover') {
      setComponentState(prev => ({ ...prev, buttonState: 'default' }));
    }
  };

  const handleButtonClick = () => {
    setComponentState(prev => ({ ...prev, buttonState: 'active' }));
    setTimeout(() => {
      setComponentState(prev => ({ ...prev, buttonState: 'default' }));
    }, 150);
    onButtonClick?.();
  };

  // Render Quest Component
  const renderQuest = (quest: any) => {
    const currentState = componentState.questStates[quest.questKey] || 'locked';
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
  };

  // Render Timer Component
  const renderTimer = () => {
    if (!questlineData.timer) return null;

    return (
      <TimerRenderer
        timer={questlineData.timer}
        scale={scale}
      />
    );
  };

  // Render Header Component
  const renderHeader = () => {
    if (!questlineData.header) return null;

    const currentState = componentState.headerState;
    const headerImage = assets?.headerImages?.[currentState];

    return (
      <HeaderRenderer
        header={questlineData.header}
        currentState={currentState}
        scale={scale}
        headerImage={headerImage}
        onCycleState={cycleHeaderState}
      />
    );
  };

  // Render Rewards Component
  const renderRewards = () => {
    if (!questlineData.rewards) return null;

    const currentState = componentState.rewardsState;
    const rewardsImage = assets?.rewardsImages?.[currentState];

    return (
      <RewardsRenderer
        rewards={questlineData.rewards}
        currentState={currentState}
        scale={scale}
        rewardsImage={rewardsImage}
        onCycleState={cycleRewardsState}
      />
    );
  };

  // Render Button Component
  const renderButton = () => {
    if (!questlineData.button) return null;

    const currentState = componentState.buttonState;

    return (
      <ButtonRenderer
        button={questlineData.button}
        currentState={currentState}
        scale={scale}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        onClick={handleButtonClick}
      />
    );
  };

  return (
    <div
      className="questline-container-wrapper"
      role="region"
      aria-label="Questline game interface"
      style={{
      width: scaledWidth + 40, // Add padding around questline
      height: scaledHeight + 40, // Add padding around questline
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: 'var(--pf-surface, #f5f5f5)'
    }}>
      <div
        className="questline-viewer questline-canvas"
        role="img"
        aria-label="Interactive questline with clickable quests and components"
        style={{
        width: scaledWidth,
        height: scaledHeight,
        position: 'relative',
        backgroundImage: assets.backgroundImage ? `url(${assets.backgroundImage})` : undefined,
        backgroundSize: `${scaledWidth}px ${scaledHeight}px`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '2px solid var(--pf-border, #ddd)',
        borderRadius: '8px',
        overflow: 'visible',
        boxShadow: 'var(--elev-1, 0 4px 12px rgba(0,0,0,0.1))'
      }}>
        {/* Content bounds indicator */}
        <div
          className="content-bounds"
          style={{
            position: 'absolute',
            left: contentBounds.minX,
            top: contentBounds.minY,
            width: contentBounds.width,
            height: contentBounds.height,
            border: '2px dotted #ff6b35',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.7
          }}
          title="Content bounds including overflow"
        />
        {assets.backgroundImage && (
          <div className="questline-background">
            <img
              src={assets.backgroundImage}
              alt="Questline background"
              className="questline-background-image"
              style={{
                width: scaledWidth,
                height: scaledHeight
              }}
            />
          </div>
        )}
        {renderTimer()}
        {renderHeader()}
        {renderRewards()}
        {Array.isArray(questlineData?.quests) ? questlineData.quests.map(renderQuest) : null}
        {renderButton()}
      </div>
    </div>
  );
};
