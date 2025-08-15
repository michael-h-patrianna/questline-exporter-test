import { DropShadow, Fill } from '../types';

// Simple gradient to CSS conversion
export const convertFillToCSS = (fill: Fill): string => {
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
export const convertShadowsToCSS = (shadows: DropShadow[], scale: number = 1): string => {
  if (!shadows || shadows.length === 0) return 'none';

  return shadows
    .map((shadow: any) => `${shadow.x * scale}px ${shadow.y * scale}px ${shadow.blur * scale}px ${shadow.spread * scale}px ${shadow.color}`)
    .join(', ');
};

// Calculate responsive scale
export const calculateScale = (
  frameSize: { width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  maxScale: number = 2
): number => {
  const scaleX = (containerWidth - 40) / frameSize.width;
  const scaleY = (containerHeight - 40) / frameSize.height;
  return Math.min(scaleX, scaleY, maxScale);
};

// Quest position calculation
export const getQuestPosition = (bounds: any, scale: number) => ({
  left: bounds.x * scale,
  top: bounds.y * scale,
  width: bounds.w * scale,
  height: bounds.h * scale,
  transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined
});

// Timer position calculation (center-based)
export const getTimerPosition = (timer: any, scale: number) => {
  const width = timer.dimensions.width * scale;
  const height = timer.dimensions.height * scale;

  return {
    left: (timer.position.x * scale) - (width / 2),
    top: (timer.position.y * scale) - (height / 2),
    width,
    height
  };
};

// Header position calculation (centerX, bottomY)
export const getHeaderPosition = (bounds: any, scale: number) => {
  const width = bounds.width * scale;
  const height = bounds.height * scale;

  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.bottomY * scale) - height,
    width,
    height
  };
};

// Rewards position calculation (centerX, centerY)
export const getRewardsPosition = (bounds: any, scale: number) => {
  const width = bounds.width * scale;
  const height = bounds.height * scale;

  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.centerY * scale) - (height / 2),
    width,
    height
  };
};

// Button position calculation (center-based)
export const getButtonPosition = (button: any, scale: number, estimatedWidth: number = 160, estimatedHeight: number = 60) => {
  const width = estimatedWidth * scale;
  const height = estimatedHeight * scale;

  return {
    left: (button.position.x * scale) - (width / 2),
    top: (button.position.y * scale) - (height / 2),
    width,
    height
  };
};
