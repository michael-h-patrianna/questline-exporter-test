import React from 'react';
import { ButtonState } from '../../types';
import { convertFillToCSS, convertShadowsToCSS } from '../../utils/utils.simple';

interface ButtonRendererProps {
  button: any;
  currentState: ButtonState;
  scale: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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
  if (!button) return null;

  const stateStyle = button.stateStyles[currentState];
  if (!stateStyle) return null;

  // Determine styling based on layoutSizing mode
  const isAutolayout = stateStyle.frame.isAutolayout;
  const layoutSizing = stateStyle.frame.layoutSizing;

  // Create CSS variables for position.json styles
  // Button uses center-based positioning (position.x, position.y are center coordinates)
  const cssVariables: Record<string, string> = {
    '--button-left': `${button.position.x * scale}px`,
    '--button-top': `${button.position.y * scale}px`,
    '--button-bg': convertFillToCSS(stateStyle.frame.backgroundFill),
    '--button-border-radius': `${stateStyle.frame.borderRadius * scale}px`,
    '--button-box-shadow': convertShadowsToCSS(stateStyle.frame.dropShadows, scale),
    '--button-border': stateStyle.frame.stroke
      ? `${stateStyle.frame.stroke.width * scale}px solid ${stateStyle.frame.stroke.color}`
      : 'none',
    '--button-font-size': `${stateStyle.text.fontSize * scale}px`,
    '--button-color': stateStyle.text.color,
    '--button-padding': isAutolayout
      ? `${stateStyle.frame.padding.vertical * scale}px ${stateStyle.frame.padding.horizontal * scale}px`
      : '0'
  };

    // Handle sizing based on layout mode
  if (isAutolayout) {
    // Button is using auto-layout
    if (layoutSizing) {
      // Handle horizontal sizing
      if (layoutSizing.horizontal === "HUG") {
        // HUG: Auto width based on content + padding - don't set width
        // Leave width unset to allow content to determine size
      } else if (layoutSizing.horizontal === "FILL") {
        // FILL: Use available space
        cssVariables['--button-width'] = '100%';
      } else {
        // FIXED: Use actual dimensions from position.json
        cssVariables['--button-width'] = `${stateStyle.frame.dimensions?.width * scale || 160 * scale}px`;
      }

      // Handle vertical sizing
      if (layoutSizing.vertical === "HUG") {
        // HUG: Auto height based on content + padding - don't set height
        // Leave height unset to allow content to determine size
      } else if (layoutSizing.vertical === "FILL") {
        // FILL: Use available space
        cssVariables['--button-height'] = '100%';
      } else {
        // FIXED: Use actual dimensions from position.json
        cssVariables['--button-height'] = `${stateStyle.frame.dimensions?.height * scale || 60 * scale}px`;
      }
    }
    // If layoutSizing is undefined but isAutolayout is true, 
    // default to HUG behavior (content-based sizing)
  } else {
    // Not auto-layout: Use actual dimensions from position.json
    cssVariables['--button-width'] = `${stateStyle.frame.dimensions?.width * scale || 160 * scale}px`;
    cssVariables['--button-height'] = `${stateStyle.frame.dimensions?.height * scale || 60 * scale}px`;
  }

  // Get button text based on current state
  const getButtonText = (state: ButtonState): string => {
    switch (state) {
      case 'default': return 'DEFAULT';
      case 'hover': return 'HOVER';
      case 'active': return 'PRESSED';
      case 'disabled': return 'DISABLED';
      default: return 'DEFAULT';
    }
  };

  return (
    <button
      className="button-component"
      data-button-state={currentState}
      style={cssVariables}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      disabled={currentState === 'disabled'}
      title={`Button (${currentState})`}
    >
      {getButtonText(currentState)}
    </button>
  );
};
