import React, { useCallback, useState } from 'react';
import { ButtonState, ExtractedAssets, HeaderState, QuestlineExport, QuestState, RewardsState } from './types';

interface QuestlineViewerProps {
  // Required
  data: QuestlineExport;

  // Optional with sensible defaults
  images?: ExtractedAssets;
  scale?: number;
  interactive?: boolean;

  // Callbacks
  onQuestClick?: (questKey: string) => void;
  onQuestStateChange?: (questKey: string, state: QuestState) => void;

  // Styling (cross-platform compatible)
  style?: React.CSSProperties;
  containerWidth: number;
  containerHeight: number;
}

interface ComponentState {
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;
}

export const QuestlineViewer: React.FC<QuestlineViewerProps> = ({
  data,
  images,
  scale: propScale,
  interactive = true,
  onQuestClick,
  onQuestStateChange,
  style,
  containerWidth,
  containerHeight
}) => {
  // Initialize state
  const [componentState, setComponentState] = useState<ComponentState>(() => ({
    questStates: data.quests.reduce((acc, quest) => {
      acc[quest.questKey] = 'locked';
      return acc;
    }, {} as Record<string, QuestState>),
    headerState: 'active',
    rewardsState: 'active',
    buttonState: 'default'
  }));

  // Calculate responsive scale
  const calculateScale = () => {
    if (propScale) return propScale;

    const scaleX = (containerWidth - 40) / data.frameSize.width;
    const scaleY = (containerHeight - 40) / data.frameSize.height;
    return Math.min(scaleX, scaleY, 2); // Max scale of 2x
  };

  const actualScale = calculateScale();
  const scaledWidth = data.frameSize.width * actualScale;
  const scaledHeight = data.frameSize.height * actualScale;
  const offsetX = (containerWidth - scaledWidth) / 2;
  const offsetY = (containerHeight - scaledHeight) / 2;

  // Quest state cycling
  const cycleQuestState = useCallback((questKey: string) => {
    if (!interactive) return;

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

    onQuestClick?.(questKey);
    onQuestStateChange?.(questKey, nextState);
  }, [interactive, componentState.questStates, onQuestClick, onQuestStateChange]);

  // Header state cycling
  const cycleHeaderState = useCallback(() => {
    if (!interactive) return;

    const stateOrder: HeaderState[] = ['active', 'success', 'fail'];
    const currentIndex = stateOrder.indexOf(componentState.headerState);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    setComponentState(prev => ({ ...prev, headerState: nextState }));
  }, [interactive, componentState.headerState]);

  // Rewards state cycling
  const cycleRewardsState = useCallback(() => {
    if (!interactive) return;

    const stateOrder: RewardsState[] = ['active', 'fail', 'claimed'];
    const currentIndex = stateOrder.indexOf(componentState.rewardsState);
    const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

    setComponentState(prev => ({ ...prev, rewardsState: nextState }));
  }, [interactive, componentState.rewardsState]);

  // Button state management
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

  const handleButtonMouseDown = () => {
    setComponentState(prev => ({ ...prev, buttonState: 'active' }));
  };

  const handleButtonMouseUp = () => {
    setComponentState(prev => ({ ...prev, buttonState: 'hover' }));
  };

  // Simple gradient to CSS conversion
  const convertFillToCSS = (fill: any): string => {
    if (fill.type === 'solid') {
      return fill.color || 'transparent';
    }

    if (fill.type === 'gradient' && fill.gradient) {
      const { gradient } = fill;
      const stops = gradient.stops
        .map((stop: any) => `${stop.color} ${(stop.position * 100).toFixed(1)}%`)
        .join(', ');

      if (gradient.type === 'linear') {
        const angle = gradient.rotation || 0;
        return `linear-gradient(${angle}deg, ${stops})`;
      }

      if (gradient.type === 'radial') {
        return `radial-gradient(circle, ${stops})`;
      }

      if (gradient.type === 'angular') {
        const angle = gradient.rotation || 0;
        return `conic-gradient(from ${angle}deg, ${stops})`;
      }
    }

    return 'transparent';
  };

  // Simple shadow conversion
  const convertShadowsToCSS = (shadows: any[]): string => {
    if (!shadows || shadows.length === 0) return 'none';

    return shadows
      .map(shadow => `${shadow.x * actualScale}px ${shadow.y * actualScale}px ${shadow.blur * actualScale}px ${shadow.spread * actualScale}px ${shadow.color}`)
      .join(', ');
  };

  // Render Quest Component
  const renderQuest = (quest: any) => {
    const currentState = componentState.questStates[quest.questKey] || 'locked';
    const bounds = quest.stateBounds[currentState];
    const questImage = images?.questImages[quest.questKey]?.[currentState];

    const questStyle: React.CSSProperties = {
      position: 'absolute',
      left: bounds.x * actualScale,
      top: bounds.y * actualScale,
      width: bounds.w * actualScale,
      height: bounds.h * actualScale,
      transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined,
      cursor: interactive ? 'pointer' : 'default',
      transition: 'opacity 0.2s ease',
      zIndex: 10
    };

    return (
      <div
        key={quest.questKey}
        style={questStyle}
        onClick={() => cycleQuestState(quest.questKey)}
        title={`${quest.questKey} (${currentState})`}
      >
        {questImage ? (
          <img
            src={questImage}
            alt={`${quest.questKey} - ${currentState}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: getQuestStateColor(currentState),
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: Math.max(8, bounds.w * actualScale * 0.15),
              fontWeight: 'bold',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {quest.questKey}
            <br />
            <small>{currentState}</small>
          </div>
        )}
      </div>
    );
  };

  // Render Timer Component
  const renderTimer = () => {
    if (!data.timer) return null;

    const timer = data.timer;
    const width = timer.dimensions.width * actualScale;
    const height = timer.dimensions.height * actualScale;

    const timerStyle: React.CSSProperties = {
      position: 'absolute',
      left: (timer.position.x * actualScale) - (width / 2),
      top: (timer.position.y * actualScale) - (height / 2),
      width,
      height,
      background: convertFillToCSS(timer.backgroundFill),
      borderRadius: timer.borderRadius * actualScale,
      boxShadow: convertShadowsToCSS(timer.dropShadows),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: timer.textStyle.fontSize * actualScale,
      color: timer.textStyle.color,
      fontWeight: timer.textStyle.fontWeight || 600,
      textAlign: 'center',
      userSelect: 'none',
      zIndex: 25,
      // Handle layoutSizing
      ...(timer.layoutSizing?.horizontal === 'FILL' && { width: '100%' }),
      ...(timer.layoutSizing?.vertical === 'FILL' && { height: '100%' }),
    };

    return (
      <div style={timerStyle} title="Timer Component">
        05:42
      </div>
    );
  };

  // Render Header Component
  const renderHeader = () => {
    if (!data.header) return null;

    const header = data.header;
    const currentState = componentState.headerState;
    const bounds = header.stateBounds[currentState];
    const headerImage = images?.headerImages?.[currentState];

    const width = bounds.width * actualScale;
    const height = bounds.height * actualScale;

    const headerStyle: React.CSSProperties = {
      position: 'absolute',
      left: (bounds.centerX * actualScale) - (width / 2),
      top: (bounds.bottomY * actualScale) - height,
      width,
      height,
      transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined,
      cursor: interactive ? 'pointer' : 'default',
      transition: 'opacity 0.2s ease',
      zIndex: 20
    };

    return (
      <div
        style={headerStyle}
        onClick={cycleHeaderState}
        title={`Header (${currentState})`}
      >
        {headerImage ? (
          <img
            src={headerImage}
            alt={`Header - ${currentState}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: getHeaderStateColor(currentState),
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: Math.max(12, width * 0.08),
              fontWeight: 'bold',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.4)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            HEADER<br /><small>{currentState.toUpperCase()}</small>
          </div>
        )}
      </div>
    );
  };

  // Render Rewards Component
  const renderRewards = () => {
    if (!data.rewards) return null;

    const rewards = data.rewards;
    const currentState = componentState.rewardsState;
    const bounds = rewards.stateBounds[currentState];
    const rewardsImage = images?.rewardsImages?.[currentState];

    const width = bounds.width * actualScale;
    const height = bounds.height * actualScale;

    const rewardsStyle: React.CSSProperties = {
      position: 'absolute',
      left: (bounds.centerX * actualScale) - (width / 2),
      top: (bounds.centerY * actualScale) - (height / 2),
      width,
      height,
      transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined,
      cursor: interactive ? 'pointer' : 'default',
      transition: 'opacity 0.2s ease',
      zIndex: 15
    };

    return (
      <div
        style={rewardsStyle}
        onClick={cycleRewardsState}
        title={`Rewards (${currentState})`}
      >
        {rewardsImage ? (
          <img
            src={rewardsImage}
            alt={`Rewards - ${currentState}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: getRewardsStateColor(currentState),
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: Math.max(10, width * 0.06),
              fontWeight: 'bold',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            REWARDS<br /><small>{currentState.toUpperCase()}</small>
          </div>
        )}
      </div>
    );
  };

  // Render Button Component
  const renderButton = () => {
    if (!data.button) return null;

    const button = data.button;
    const currentState = componentState.buttonState;
    const stateStyle = button.stateStyles[currentState];

    if (!stateStyle) return null;

    const estimatedWidth = 160;
    const estimatedHeight = 60;
    const width = estimatedWidth * actualScale;
    const height = estimatedHeight * actualScale;

    const buttonStyle: React.CSSProperties = {
      position: 'absolute',
      left: (button.position.x * actualScale) - (width / 2),
      top: (button.position.y * actualScale) - (height / 2),
      width,
      height,
      background: convertFillToCSS(stateStyle.frame.backgroundFill),
      borderRadius: stateStyle.frame.borderRadius * actualScale,
      boxShadow: convertShadowsToCSS(stateStyle.frame.dropShadows),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: stateStyle.text.fontSize * actualScale,
      color: stateStyle.text.color,
      fontWeight: 'bold',
      textAlign: 'center',
      cursor: currentState === 'disabled' ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      transition: 'all 0.15s ease',
      zIndex: 30,
      // Complete stroke support
      ...(stateStyle.frame.stroke && {
        border: `${stateStyle.frame.stroke.width * actualScale}px solid ${stateStyle.frame.stroke.color}`
      }),
    };

    return (
      <div
        style={buttonStyle}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        onMouseDown={handleButtonMouseDown}
        onMouseUp={handleButtonMouseUp}
        title={`Button (${currentState})`}
      >
        CLAIM REWARDS
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    width: containerWidth,
    height: containerHeight,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    ...style
  };

  const questlineStyle: React.CSSProperties = {
    width: scaledWidth,
    height: scaledHeight,
    position: 'relative',
    backgroundImage: images?.backgroundImage ? `url(${images.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: '2px solid #ddd',
    borderRadius: '8px',
    overflow: 'visible',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  return (
    <div style={containerStyle}>
      <div style={questlineStyle}>
        {renderTimer()}
        {renderHeader()}
        {renderRewards()}
        {data.quests.map(renderQuest)}
        {renderButton()}
      </div>
    </div>
  );
};

// Helper functions for fallback colors
const getQuestStateColor = (state: QuestState): string => {
  const colorMap: Record<QuestState, string> = {
    'locked': '#666666',
    'active': '#ffaa00',
    'unclaimed': '#00aa00',
    'completed': '#0066aa'
  };
  return colorMap[state];
};

const getHeaderStateColor = (state: HeaderState): string => {
  const colorMap: Record<HeaderState, string> = {
    'active': '#4a90e2',
    'success': '#7ed321',
    'fail': '#d0021b'
  };
  return colorMap[state];
};

const getRewardsStateColor = (state: RewardsState): string => {
  const colorMap: Record<RewardsState, string> = {
    'active': '#f5a623',
    'fail': '#b83d42',
    'claimed': '#50c878'
  };
  return colorMap[state];
};
