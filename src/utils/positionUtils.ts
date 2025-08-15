// Utility functions for position conversion and CSS generation

import { ButtonComponent, DropShadow, Fill, HeaderBounds, QuestBounds, RewardsBounds, TimerComponent } from '../types';

// Scale calculation for responsive canvas
export interface ScaleCalculation {
  scale: number;
  actualWidth: number;
  actualHeight: number;
  offsetX: number;
  offsetY: number;
}

export function calculateScale(
  frameSize: { width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  zoomLevel: number = 1.0
): ScaleCalculation {
  // Calculate base scale to fit container while maintaining aspect ratio
  const scaleX = containerWidth / frameSize.width;
  const scaleY = containerHeight / frameSize.height;
  const baseScale = Math.min(scaleX, scaleY);

  // Apply zoom level
  const scale = baseScale * zoomLevel;

  // Calculate actual dimensions
  const actualWidth = frameSize.width * scale;
  const actualHeight = frameSize.height * scale;

  // Calculate centering offsets
  const offsetX = (containerWidth - actualWidth) / 2;
  const offsetY = (containerHeight - actualHeight) / 2;

  return { scale, actualWidth, actualHeight, offsetX, offsetY };
}

// Convert quest bounds (top-left coordinates)
export function convertQuestPosition(
  bounds: QuestBounds,
  scale: number
): { left: number; top: number; width: number; height: number; transform?: string } {
  // Handle missing bounds gracefully
  if (!bounds) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const transform = bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined;

  return {
    left: bounds.x * scale,
    top: bounds.y * scale,
    width: bounds.w * scale,
    height: bounds.h * scale,
    transform
  };
}

// Convert timer position (center coordinates)
export function convertTimerPosition(
  timer: TimerComponent,
  scale: number
): { left: number; top: number; width: number; height: number } {
  const width = timer.dimensions.width * scale;
  const height = timer.dimensions.height * scale;

  return {
    left: (timer.position.x * scale) - (width / 2),
    top: (timer.position.y * scale) - (height / 2),
    width,
    height
  };
}

// Convert header position (centerX, bottomY coordinates)
export function convertHeaderPosition(
  bounds: HeaderBounds,
  scale: number
): { left: number; top: number; width: number; height: number; transform?: string } {
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  const transform = bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined;

  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.bottomY * scale) - height,
    width,
    height,
    transform
  };
}

// Convert rewards position (centerX, centerY coordinates)
export function convertRewardsPosition(
  bounds: RewardsBounds,
  scale: number
): { left: number; top: number; width: number; height: number; transform?: string } {
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  const transform = bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined;

  return {
    left: (bounds.centerX * scale) - (width / 2),
    top: (bounds.centerY * scale) - (height / 2),
    width,
    height,
    transform
  };
}

// Convert button position (center coordinates)
export function convertButtonPosition(
  button: ButtonComponent,
  scale: number,
  width: number = 120, // Default button width
  height: number = 60  // Default button height
): { left: number; top: number; width: number; height: number } {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return {
    left: (button.position.x * scale) - (scaledWidth / 2),
    top: (button.position.y * scale) - (scaledHeight / 2),
    width: scaledWidth,
    height: scaledHeight
  };
}

// Convert Fill object to CSS background
export function convertFillToCSS(fill: Fill): string {
  if (fill.type === 'solid') {
    return fill.color || 'transparent';
  }

  if (fill.type === 'gradient' && fill.gradient) {
    const { gradient } = fill;
    const stops = gradient.stops
      .map(stop => `${stop.color} ${(stop.position * 100).toFixed(1)}%`)
      .join(', ');

    if (gradient.type === 'linear') {
      const angle = gradient.rotation ? `${gradient.rotation}deg` : '0deg';
      return `linear-gradient(${angle}, ${stops})`;
    }

    if (gradient.type === 'radial') {
      return `radial-gradient(circle, ${stops})`;
    }

    if (gradient.type === 'angular') {
      const angle = gradient.rotation ? `${gradient.rotation}deg` : '0deg';
      return `conic-gradient(from ${angle}, ${stops})`;
    }
  }

  return 'transparent';
}

// Convert drop shadows to CSS box-shadow
export function convertDropShadowsToCSS(shadows: DropShadow[]): string {
  if (!shadows || shadows.length === 0) {
    return 'none';
  }

  return shadows
    .map(shadow => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`)
    .join(', ');
}

// Generate CSS transform string
export function generateTransform(rotation?: number, scale?: number): string {
  const transforms: string[] = [];

  if (scale && scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  if (rotation) {
    transforms.push(`rotate(${rotation}deg)`);
  }

  return transforms.length > 0 ? transforms.join(' ') : 'none';
}

// Get responsive font size
export function getResponsiveFontSize(baseFontSize: number, scale: number): number {
  const minSize = 8;
  const maxSize = 48;
  const scaledSize = baseFontSize * scale;
  return Math.max(minSize, Math.min(maxSize, scaledSize));
}

// Get fallback color for quest states
export function getQuestStateColor(state: string): string {
  const colorMap: Record<string, string> = {
    locked: '#666666',
    active: '#ffaa00',
    unclaimed: '#00aa00',
    completed: '#0066aa'
  };
  return colorMap[state] || '#999999';
}

// Get vertical alignment CSS
export function getVerticalAlignment(align?: string): string {
  switch (align?.toLowerCase()) {
    case 'top': return 'flex-start';
    case 'center': return 'center';
    case 'bottom': return 'flex-end';
    default: return 'center';
  }
}

// Get horizontal alignment CSS
export function getHorizontalAlignment(align?: string): string {
  switch (align?.toLowerCase()) {
    case 'left': return 'flex-start';
    case 'center': return 'center';
    case 'right': return 'flex-end';
    default: return 'center';
  }
}
