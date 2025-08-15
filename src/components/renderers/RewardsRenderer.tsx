import React from 'react';
import { RewardsState } from '../../types';

interface RewardsRendererProps {
  rewards: any;
  currentState: RewardsState;
  scale: number;
  rewardsImage?: string;
  onCycleState: () => void;
}

export const RewardsRenderer: React.FC<RewardsRendererProps> = ({
  rewards,
  currentState,
  scale,
  rewardsImage,
  onCycleState
}) => {
  if (!rewards) return null;

  const bounds = rewards.stateBounds[currentState];
  const width = bounds.width * scale;
  const height = bounds.height * scale;

  const getRewardsStateColor = (state: RewardsState): string => {
    const colorMap: Record<RewardsState, string> = {
      'active': '#f5a623',
      'fail': '#b83d42',
      'claimed': '#50c878'
    };
    return colorMap[state];
  };

  // Create CSS variables for position.json styles
  // Rewards uses centerX, centerY positioning - calculate center offset in JS
  const cssVariables: Record<string, string> = {
    '--rewards-left': `${(bounds.centerX * scale) - (width / 2)}px`,
    '--rewards-top': `${(bounds.centerY * scale) - (height / 2)}px`,
    '--rewards-width': `${width}px`,
    '--rewards-height': `${height}px`,
    '--rewards-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none',
    '--rewards-fallback-bg': getRewardsStateColor(currentState),
    '--rewards-fallback-font-size': `${Math.max(10, width * 0.06)}px`
  };

  return (
    <div
      className="rewards-component"
      data-rewards-state={currentState}
      style={cssVariables}
      onClick={onCycleState}
      title={`Rewards (${currentState})`}
    >
      {rewardsImage ? (
        <img
          src={rewardsImage}
          alt={`Rewards - ${currentState}`}
          className="rewards-image"
          draggable={false}
        />
      ) : (
        <div className="rewards-fallback">
          REWARDS<br /><small>{currentState.toUpperCase()}</small>
        </div>
      )}
    </div>
  );
};
