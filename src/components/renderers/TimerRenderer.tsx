import React from 'react';
import { convertFillToCSS, convertShadowsToCSS } from '../../utils/utils.simple';

interface TimerRendererProps {
  timer: any;
  scale: number;
}

export const TimerRenderer: React.FC<TimerRendererProps> = ({ timer, scale }) => {
  if (!timer) return null;

  // Determine styling based on layoutSizing mode
  const isAutolayout = timer.isAutolayout;
  const layoutSizing = timer.layoutSizing;

  // Create CSS variables for position.json styles
  // Timer uses center-based positioning (position.x, position.y are center coordinates)
  const cssVariables: Record<string, string> = {
    '--timer-left': `${timer.position.x * scale}px`,
    '--timer-top': `${timer.position.y * scale}px`,
    '--timer-bg': convertFillToCSS(timer.backgroundFill),
    '--timer-border-radius': `${timer.borderRadius * scale}px`,
    '--timer-box-shadow': convertShadowsToCSS(timer.dropShadows, scale),
    '--timer-font-size': `${timer.textStyle.fontSize * scale}px`,
    '--timer-color': timer.textStyle.color,
    '--timer-font-weight': `${timer.textStyle.fontWeight || 600}`,
    '--timer-text-align': timer.textStyle.textAlignHorizontal?.toLowerCase() || 'center',
    '--timer-padding': isAutolayout
      ? `${timer.padding.vertical * scale}px ${timer.padding.horizontal * scale}px`
      : '0'
  };

  // Handle sizing based on layout mode
  if (isAutolayout) {
    // Timer is using auto-layout
    if (layoutSizing) {
      // Handle horizontal sizing
      if (layoutSizing.horizontal === "HUG") {
        // HUG: Auto width based on content + padding - don't set width
        // Leave width unset to allow content to determine size
      } else if (layoutSizing.horizontal === "FILL") {
        // FILL: Use available space
        cssVariables['--timer-width'] = '100%';
      } else {
        // FIXED: Use actual dimensions from position.json
        cssVariables['--timer-width'] = `${timer.dimensions.width * scale}px`;
      }

      // Handle vertical sizing
      if (layoutSizing.vertical === "HUG") {
        // HUG: Auto height based on content + padding - don't set height
        // Leave height unset to allow content to determine size
      } else if (layoutSizing.vertical === "FILL") {
        // FILL: Use available space
        cssVariables['--timer-height'] = '100%';
      } else {
        // FIXED: Use actual dimensions from position.json
        cssVariables['--timer-height'] = `${timer.dimensions.height * scale}px`;
      }
    }
    // If layoutSizing is undefined but isAutolayout is true, 
    // default to HUG behavior (content-based sizing)
  } else {
    // Not auto-layout: Use actual dimensions from position.json
    cssVariables['--timer-width'] = `${timer.dimensions.width * scale}px`;
    cssVariables['--timer-height'] = `${timer.dimensions.height * scale}px`;
  }

  return (
    <div
      className="timer-component"
      style={cssVariables}
      title="Timer Component"
    >
      05:42
    </div>
  );
};
