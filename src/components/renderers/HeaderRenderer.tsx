import React from 'react';
import { HeaderState } from '../../types';

interface HeaderRendererProps {
  header: any;
  currentState: HeaderState;
  scale: number;
  headerImage?: string;
  onCycleState: () => void;
}

export const HeaderRenderer: React.FC<HeaderRendererProps> = ({
  header,
  currentState,
  scale,
  headerImage,
  onCycleState
}) => {
  if (!header) return null;

  const bounds = header.stateBounds[currentState];
  const width = bounds.width * scale;
  const height = bounds.height * scale;

  const getHeaderStateColor = (state: HeaderState): string => {
    const colorMap: Record<HeaderState, string> = {
      'active': '#4a90e2',
      'success': '#7ed321',
      'fail': '#d0021b'
    };
    return colorMap[state];
  };

  // Create CSS variables for position.json styles
  // Header uses centerX, bottomY positioning - calculate center offset in JS
  const cssVariables: Record<string, string> = {
    '--header-left': `${(bounds.centerX * scale) - (width / 2)}px`,
    '--header-top': `${(bounds.bottomY * scale) - height}px`,
    '--header-width': `${width}px`,
    '--header-height': `${height}px`,
    '--header-transform': bounds.rotation ? `rotate(${bounds.rotation}deg)` : 'none',
    '--header-fallback-bg': getHeaderStateColor(currentState),
    '--header-fallback-font-size': `${Math.max(12, width * 0.08)}px`
  };

  return (
    <div
      className="header-component"
      data-header-state={currentState}
      style={cssVariables}
      onClick={onCycleState}
      title={`Header (${currentState})`}
    >
      {headerImage ? (
        <img
          src={headerImage}
          alt={`Header - ${currentState}`}
          className="header-image"
          draggable={false}
        />
      ) : (
        <div className="header-fallback">
          HEADER<br /><small>{currentState.toUpperCase()}</small>
        </div>
      )}
    </div>
  );
};
