import React from 'react';
import { QuestState } from '../../types';

interface QuestRendererProps {
  quest: any;
  currentState: QuestState;
  scale: number;
  questImage?: string;
  showQuestKeys?: boolean;
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
  // Safely handle missing quest data
  if (!quest?.questKey || !quest?.stateBounds) {
    return null;
  }

  const bounds = quest.stateBounds[currentState];

  // Handle missing bounds for the current state
  if (!bounds) {
    return null;
  }

  const getQuestStateColor = (state: QuestState): string => {
    const colorMap: Record<QuestState, string> = {
      'locked': '#666666',
      'active': '#ffaa00',
      'unclaimed': '#00aa00',
      'completed': '#0066aa'
    };
    return colorMap[state];
  };

  // Create CSS variables for position.json styles
  // Quest uses top-left positioning (x, y are top-left coordinates)
  const cssVariables: Record<string, string> = {
    '--quest-left': `${bounds.x * scale}px`,
    '--quest-top': `${bounds.y * scale}px`,
    '--quest-width': `${bounds.w * scale}px`,
    '--quest-height': `${bounds.h * scale}px`,
    '--quest-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none',
    '--quest-fallback-bg': getQuestStateColor(currentState),
    '--quest-fallback-font-size': `${Math.max(8, bounds.w * scale * 0.15)}px`
  };

  return (
    <div
      key={quest.questKey}
      className="quest-component"
      data-quest-key={quest.questKey}
      data-quest-state={currentState}
      role="button"
      tabIndex={0}
      aria-label={`Quest ${quest.questKey} - ${currentState}`}
      style={cssVariables}
      onClick={() => onCycleState(quest.questKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleState(quest.questKey);
        }
      }}
      title={`${quest.questKey} (${currentState})`}
    >
      {questImage ? (
        <>
          <img
            src={questImage}
            alt={`${quest.questKey} - ${currentState}`}
            className="quest-image"
            draggable={false}
          />
          {showQuestKeys && (
            <div className="quest-key-overlay">
              {quest.questKey}
            </div>
          )}
        </>
      ) : (
        <div className="quest-fallback">
          {quest.questKey}
          <br />
          <small>{currentState}</small>
        </div>
      )}
    </div>
  );
};
