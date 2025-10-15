/**
 * Tests for consolidated utility functions
 */

import type { DropShadow, Fill } from '../../types';
import { calculateQuestlineScale, convertFillToCSS, convertShadowsToCSS } from '../utils';

describe('Consolidated Utils', () => {
  describe('convertFillToCSS', () => {
    it('should convert solid fill to CSS color', () => {
      const solidFill: Fill = {
        type: 'solid',
        color: '#ff0000',
      };

      const result = convertFillToCSS(solidFill);
      expect(result).toBe('#ff0000');
    });

    it('should convert linear gradient to CSS', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 45,
          stops: [
            { color: '#ff0000', position: 0 },
            { color: '#00ff00', position: 1 },
          ],
        },
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('linear-gradient(45deg, #ff0000 0.0%, #00ff00 100.0%)');
    });

    it('should convert radial gradient to CSS', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'radial',
          stops: [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 1 },
          ],
        },
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('radial-gradient(circle, #ff0000 0.0%, #0000ff 100.0%)');
    });

    it('should return transparent for invalid fills', () => {
      const result = convertFillToCSS({ type: 'solid' } as Fill);
      expect(result).toBe('transparent');
    });
  });

  describe('convertShadowsToCSS', () => {
    it('should convert drop shadows to CSS box-shadow', () => {
      const shadows: DropShadow[] = [
        {
          x: 2,
          y: 4,
          blur: 6,
          spread: 1,
          color: 'rgba(0, 0, 0, 0.3)',
        },
        {
          x: 0,
          y: 2,
          blur: 4,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      ];

      const result = convertShadowsToCSS(shadows);
      expect(result).toBe('2px 4px 6px 1px rgba(0, 0, 0, 0.3), 0px 2px 4px 0px rgba(0, 0, 0, 0.1)');
    });

    it('should return none for empty shadows array', () => {
      const result = convertShadowsToCSS([]);
      expect(result).toBe('none');
    });

    it('should apply scale factor', () => {
      const shadows: DropShadow[] = [
        {
          x: 2,
          y: 4,
          blur: 6,
          spread: 1,
          color: 'rgba(0, 0, 0, 0.3)',
        },
      ];

      const result = convertShadowsToCSS(shadows, 2);
      expect(result).toBe('4px 8px 12px 2px rgba(0, 0, 0, 0.3)');
    });
  });

  describe('calculateQuestlineScale', () => {
    it('should calculate correct scale for fitting within container', () => {
      const originalSize = { width: 800, height: 600 };
      const targetSize = { width: 400, height: 300 };

      const result = calculateQuestlineScale(originalSize, targetSize);

      expect(result.scale).toBe(0.5); // min(400/800, 300/600) = 0.5
      expect(result.scaledWidth).toBe(400);
      expect(result.scaledHeight).toBe(300);
    });

    it('should maintain aspect ratio', () => {
      const originalSize = { width: 100, height: 100 };
      const targetSize = { width: 300, height: 200 };

      const result = calculateQuestlineScale(originalSize, targetSize);

      expect(result.scale).toBe(2.0); // min(300/100, 200/100) = 2.0
      expect(result.scaledWidth).toBe(200);
      expect(result.scaledHeight).toBe(200);
    });
  });
});
