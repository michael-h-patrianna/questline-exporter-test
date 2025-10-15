/**
 * Consolidated Utility Functions
 *
 * This module contains all the utility functions actually used by the questline components.
 * Consolidates functionality from utils.simple.ts and questlineDataTransform.ts.
 */

import { DropShadow, Fill, HeaderState, QuestlineExport, QuestState, RewardsState } from '../types';

// ============================================================================
// STYLE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert Fill object to CSS background
 * Supports solid colors, linear gradients, radial gradients, and conic gradients
 */
export function convertFillToCSS(fill: Fill): string {
  if (!fill) return 'transparent';

  if (fill.type === 'solid') {
    return fill.color || 'transparent';
  }

  if (fill.type === 'gradient' && fill.gradient) {
    const { gradient } = fill;
    const stops = gradient.stops
      .map((stop: any) => `${stop.color} ${(stop.position * 100).toFixed(1)}%`)
      .join(', ');

    switch (gradient.type) {
      case 'linear':
        const angle = gradient.rotation || 0;
        return `linear-gradient(${angle}deg, ${stops})`;

      case 'radial':
        return `radial-gradient(circle, ${stops})`;

      case 'angular':
        const conicalAngle = gradient.rotation || 0;
        return `conic-gradient(from ${conicalAngle}deg, ${stops})`;

      default:
        return 'transparent';
    }
  }

  return 'transparent';
}

/**
 * Convert drop shadows to CSS box-shadow
 * Supports multiple shadows and scaling
 */
export function convertShadowsToCSS(shadows: DropShadow[], scale: number = 1): string {
  if (!shadows || shadows.length === 0) return 'none';

  return shadows
    .map((shadow: any) => `${shadow.x * scale}px ${shadow.y * scale}px ${shadow.blur * scale}px ${shadow.spread * scale}px ${shadow.color}`)
    .join(', ');
}

// ============================================================================
// SCALING CALCULATIONS
// ============================================================================

/**
 * Scale calculation result for responsive questline display
 */
interface ScaleCalculation {
  scale: number;
  scaledWidth: number;
  scaledHeight: number;
}

/**
 * Calculate the scale factor for responsive questline display
 * Maintains aspect ratio while fitting within target dimensions
 */
export function calculateQuestlineScale(
  originalSize: { width: number; height: number },
  targetSize: { width: number; height: number }
): ScaleCalculation {
  const scaleX = targetSize.width / originalSize.width;
  const scaleY = targetSize.height / originalSize.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = originalSize.width * scale;
  const scaledHeight = originalSize.height * scale;

  return { scale, scaledWidth, scaledHeight };
}

/**
 * Calculate simple content bounds for questline
 * Uses frame size as the base bounds since components handle their own positioning
 */
export function calculateQuestlineContentBounds(
  questlineData: QuestlineExport,
  questStates: Record<string, QuestState>,
  headerState: HeaderState,
  rewardsState: RewardsState,
  scale: number
) {
  if (!questlineData || !questlineData.frameSize) {
    console.warn('calculateQuestlineContentBounds: Invalid questline data');
    return {
      minX: 0,
      minY: 0,
      maxX: 800 * scale,
      maxY: 600 * scale,
      width: 800 * scale,
      height: 600 * scale
    };
  }

  const width = questlineData.frameSize.width * scale;
  const height = questlineData.frameSize.height * scale;

  return {
    minX: 0,
    minY: 0,
    maxX: width,
    maxY: height,
    width,
    height
  };
}
