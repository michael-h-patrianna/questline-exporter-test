import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonState, ExtractedAssets, HeaderState, QuestlineExport, QuestState, RewardsState } from './types';
import { calculateScale } from './utils.simple';

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

  // Styling (React Native style)
  style?: any;
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
  const actualScale = propScale || calculateScale(data.frameSize, containerWidth, containerHeight);
  const scaledWidth = data.frameSize.width * actualScale;
  const scaledHeight = data.frameSize.height * actualScale;

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

  // Convert fill to React Native compatible style
  const convertFillToRNStyle = (fill: any) => {
    if (fill.type === 'solid') {
      return { backgroundColor: fill.color || 'transparent' };
    }

    // For gradients in RN, use the first color as fallback
    if (fill.type === 'gradient' && fill.gradient) {
      return { backgroundColor: fill.gradient.stops[0]?.color || '#000' };
    }

    return { backgroundColor: 'transparent' };
  };

  // Render Quest Component
  const renderQuest = (quest: any) => {
    const currentState = componentState.questStates[quest.questKey] || 'locked';
    const bounds = quest.stateBounds[currentState];
    const questImage = images?.questImages[quest.questKey]?.[currentState];

    const questStyle = {
      position: 'absolute',
      left: bounds.x * actualScale,
      top: bounds.y * actualScale,
      width: bounds.w * actualScale,
      height: bounds.h * actualScale,
      transform: bounds.rotation ? [{ rotate: `${bounds.rotation}deg` }] : undefined,
      zIndex: 10
    };

    return (
      <TouchableOpacity
        key={quest.questKey}
        style={questStyle}
        onPress={() => cycleQuestState(quest.questKey)}
        disabled={!interactive}
        activeOpacity={0.7}
      >
        {questImage ? (
          <Image
            source={{ uri: questImage }}
            style={styles.questImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[
            styles.questFallback,
            { backgroundColor: getQuestStateColor(currentState) }
          ]}>
            <Text style={[styles.questText, { fontSize: Math.max(8, bounds.w * actualScale * 0.15) }]}>
              {quest.questKey}
            </Text>
            <Text style={[styles.questStateText, { fontSize: Math.max(6, bounds.w * actualScale * 0.1) }]}>
              {currentState}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render Timer Component
  const renderTimer = () => {
    if (!data.timer) return null;

    const timer = data.timer;
    const width = timer.dimensions.width * actualScale;
    const height = timer.dimensions.height * actualScale;

    const timerStyle = {
      position: 'absolute',
      left: (timer.position.x * actualScale) - (width / 2),
      top: (timer.position.y * actualScale) - (height / 2),
      width,
      height,
      ...convertFillToRNStyle(timer.backgroundFill),
      borderRadius: timer.borderRadius * actualScale,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 25,
      // Handle layoutSizing
      ...(timer.layoutSizing?.horizontal === 'FILL' && { width: '100%' }),
      ...(timer.layoutSizing?.vertical === 'FILL' && { height: '100%' }),
    };

    return (
      <View style={timerStyle}>
        <Text style={{
          fontSize: timer.textStyle.fontSize * actualScale,
          color: timer.textStyle.color,
          fontWeight: timer.textStyle.fontWeight ? `${timer.textStyle.fontWeight}` : '600',
          textAlign: 'center',
        }}>
          05:42
        </Text>
      </View>
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

    const headerStyle = {
      position: 'absolute',
      left: (bounds.centerX * actualScale) - (width / 2),
      top: (bounds.bottomY * actualScale) - height,
      width,
      height,
      transform: bounds.rotation ? [{ rotate: `${bounds.rotation}deg` }] : undefined,
      zIndex: 20
    };

    const cycleHeaderState = () => {
      if (!interactive) return;

      const stateOrder: HeaderState[] = ['active', 'success', 'fail'];
      const currentIndex = stateOrder.indexOf(componentState.headerState);
      const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

      setComponentState(prev => ({ ...prev, headerState: nextState }));
    };

    return (
      <TouchableOpacity
        style={headerStyle}
        onPress={cycleHeaderState}
        disabled={!interactive}
        activeOpacity={0.7}
      >
        {headerImage ? (
          <Image
            source={{ uri: headerImage }}
            style={styles.componentImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[
            styles.headerFallback,
            { backgroundColor: getHeaderStateColor(currentState) }
          ]}>
            <Text style={[styles.headerText, { fontSize: Math.max(12, width * 0.08) }]}>
              HEADER
            </Text>
            <Text style={[styles.headerStateText, { fontSize: Math.max(8, width * 0.05) }]}>
              {currentState.toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
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

    const rewardsStyle = {
      position: 'absolute',
      left: (bounds.centerX * actualScale) - (width / 2),
      top: (bounds.centerY * actualScale) - (height / 2),
      width,
      height,
      transform: bounds.rotation ? [{ rotate: `${bounds.rotation}deg` }] : undefined,
      zIndex: 15
    };

    const cycleRewardsState = () => {
      if (!interactive) return;

      const stateOrder: RewardsState[] = ['active', 'fail', 'claimed'];
      const currentIndex = stateOrder.indexOf(componentState.rewardsState);
      const nextState = stateOrder[(currentIndex + 1) % stateOrder.length];

      setComponentState(prev => ({ ...prev, rewardsState: nextState }));
    };

    return (
      <TouchableOpacity
        style={rewardsStyle}
        onPress={cycleRewardsState}
        disabled={!interactive}
        activeOpacity={0.7}
      >
        {rewardsImage ? (
          <Image
            source={{ uri: rewardsImage }}
            style={styles.componentImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[
            styles.rewardsFallback,
            { backgroundColor: getRewardsStateColor(currentState) }
          ]}>
            <Text style={[styles.rewardsText, { fontSize: Math.max(10, width * 0.06) }]}>
              REWARDS
            </Text>
            <Text style={[styles.rewardsStateText, { fontSize: Math.max(8, width * 0.04) }]}>
              {currentState.toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
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

    const buttonStyle = {
      position: 'absolute',
      left: (button.position.x * actualScale) - (width / 2),
      top: (button.position.y * actualScale) - (height / 2),
      width,
      height,
      ...convertFillToRNStyle(stateStyle.frame.backgroundFill),
      borderRadius: stateStyle.frame.borderRadius * actualScale,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 30,
      // Complete stroke support
      ...(stateStyle.frame.stroke && {
        borderWidth: stateStyle.frame.stroke.width * actualScale,
        borderColor: stateStyle.frame.stroke.color
      }),
    };

    const handleButtonPress = () => {
      setComponentState(prev => ({ ...prev, buttonState: 'active' }));
      setTimeout(() => {
        setComponentState(prev => ({ ...prev, buttonState: 'default' }));
      }, 150);
    };

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handleButtonPress}
        disabled={currentState === 'disabled'}
        activeOpacity={0.8}
      >
        <Text style={{
          fontSize: stateStyle.text.fontSize * actualScale,
          color: stateStyle.text.color,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          CLAIM REWARDS
        </Text>
      </TouchableOpacity>
    );
  };

  const containerStyle = [
    styles.container,
    {
      width: containerWidth,
      height: containerHeight,
    },
    style
  ];

  const questlineStyle = {
    width: scaledWidth,
    height: scaledHeight,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: '#fff'
  };

  return (
    <View style={containerStyle}>
      <View style={questlineStyle}>
        {images?.backgroundImage && (
          <Image
            source={{ uri: images.backgroundImage }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}
        {renderTimer()}
        {renderHeader()}
        {renderRewards()}
        {data.quests.map(renderQuest)}
        {renderButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  questImage: {
    width: '100%',
    height: '100%',
  },
  questFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  questText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questStateText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  headerFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerStateText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  rewardsFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  rewardsText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rewardsStateText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
});

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
