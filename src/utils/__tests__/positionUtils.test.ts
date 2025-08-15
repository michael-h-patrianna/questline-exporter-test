import {
    ButtonComponent,
    DropShadow,
    Fill,
    HeaderBounds,
    QuestBounds,
    RewardsBounds,
    TimerComponent
} from '../../types';
import {
    calculateScale,
    convertButtonPosition,
    convertDropShadowsToCSS,
    convertFillToCSS,
    convertHeaderPosition,
    convertQuestPosition,
    convertRewardsPosition,
    convertTimerPosition,
    generateTransform,
    getHorizontalAlignment,
    getQuestStateColor,
    getResponsiveFontSize,
    getVerticalAlignment
} from '../positionUtils';

describe('positionUtils', () => {
  describe('calculateScale', () => {
    it('should calculate correct scale for fitting within container', () => {
      const frameSize = { width: 800, height: 600 };
      const result = calculateScale(frameSize, 400, 300, 1.0);

      expect(result.scale).toBe(0.5); // min(400/800, 300/600) = 0.5
      expect(result.actualWidth).toBe(400);
      expect(result.actualHeight).toBe(300);
      expect(result.offsetX).toBe(0);
      expect(result.offsetY).toBe(0);
    });

    it('should apply zoom level correctly', () => {
      const frameSize = { width: 100, height: 100 };
      const result = calculateScale(frameSize, 200, 200, 2.0);

      expect(result.scale).toBe(4.0); // baseScale(2.0) * zoomLevel(2.0)
      expect(result.actualWidth).toBe(400);
      expect(result.actualHeight).toBe(400);
    });

    it('should center content when container is larger', () => {
      const frameSize = { width: 100, height: 100 };
      const result = calculateScale(frameSize, 300, 200, 1.0);

      expect(result.scale).toBe(2.0); // min(300/100, 200/100) = 2.0
      expect(result.actualWidth).toBe(200);
      expect(result.actualHeight).toBe(200);
      expect(result.offsetX).toBe(50); // (300-200)/2
      expect(result.offsetY).toBe(0);  // (200-200)/2
    });

    it('should handle zero dimensions gracefully', () => {
      const frameSize = { width: 0, height: 100 };
      const result = calculateScale(frameSize, 100, 100, 1.0);

      // When width is 0, scaleX becomes Infinity, but Math.min should handle it
      expect(result.scale).toBe(1.0); // Will be constrained by scaleY (100/100 = 1.0)
      expect(result.actualWidth).toBe(0);
      expect(result.actualHeight).toBe(100);
    });

    it('should handle negative zoom levels', () => {
      const frameSize = { width: 100, height: 100 };
      const result = calculateScale(frameSize, 100, 100, -1.0);

      expect(result.scale).toBe(-1.0);
      expect(result.actualWidth).toBe(-100);
      expect(result.actualHeight).toBe(-100);
    });
  });

  describe('convertQuestPosition', () => {
    const mockBounds: QuestBounds = {
      x: 10,
      y: 20,
      w: 100,
      h: 50,
      rotation: 45
    };

    it('should convert quest bounds to CSS position', () => {
      const result = convertQuestPosition(mockBounds, 2.0);

      expect(result).toEqual({
        left: 20,    // x * scale
        top: 40,     // y * scale
        width: 200,  // w * scale
        height: 100, // h * scale
        transform: 'rotate(45deg)'
      });
    });

    it('should handle no rotation', () => {
      const boundsNoRotation = { ...mockBounds, rotation: undefined };
      const result = convertQuestPosition(boundsNoRotation, 1.0);

      expect(result.transform).toBeUndefined();
    });

    it('should handle zero rotation', () => {
      const boundsZeroRotation = { ...mockBounds, rotation: 0 };
      const result = convertQuestPosition(boundsZeroRotation, 1.0);

      expect(result.transform).toBeUndefined();
    });

    it('should handle negative coordinates', () => {
      const negativeBounds: QuestBounds = {
        x: -10,
        y: -20,
        w: 30,
        h: 40
      };
      const result = convertQuestPosition(negativeBounds, 1.0);

      expect(result.left).toBe(-10);
      expect(result.top).toBe(-20);
    });
  });

  describe('convertTimerPosition', () => {
    const mockTimer: TimerComponent = {
      position: { x: 100, y: 50 },
      dimensions: { width: 80, height: 40 },
      borderRadius: 8,
      backgroundFill: { type: 'solid', color: '#000000' },
      isAutolayout: false,
      layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
      padding: { vertical: 8, horizontal: 16 },
      dropShadows: [],
      textStyle: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 500,
        textAlignHorizontal: 'center',
        textAlignVertical: 'center'
      }
    };

    it('should convert center coordinates to top-left positioning', () => {
      const result = convertTimerPosition(mockTimer, 2.0);

      expect(result).toEqual({
        left: 120,  // (100 * 2) - (80 * 2 / 2)
        top: 60,    // (50 * 2) - (40 * 2 / 2) = 100 - 40 = 60
        width: 160, // 80 * 2
        height: 80  // 40 * 2
      });
    });

    it('should handle fractional scale', () => {
      const result = convertTimerPosition(mockTimer, 0.5);

      expect(result).toEqual({
        left: 30,   // (100 * 0.5) - (80 * 0.5 / 2)
        top: 15,    // (50 * 0.5) - (40 * 0.5 / 2)
        width: 40,  // 80 * 0.5
        height: 20  // 40 * 0.5
      });
    });
  });

  describe('convertHeaderPosition', () => {
    const mockHeaderBounds: HeaderBounds = {
      centerX: 100,
      bottomY: 80,
      width: 60,
      height: 30,
      rotation: 90
    };

    it('should convert centerX, bottomY to top-left positioning', () => {
      const result = convertHeaderPosition(mockHeaderBounds, 2.0);

      expect(result).toEqual({
        left: 140,   // (100 * 2) - (60 * 2 / 2)
        top: 100,    // (80 * 2) - (30 * 2)
        width: 120,  // 60 * 2
        height: 60,  // 30 * 2
        transform: 'rotate(90deg)'
      });
    });

    it('should handle no rotation', () => {
      const boundsNoRotation = { ...mockHeaderBounds, rotation: undefined };
      const result = convertHeaderPosition(boundsNoRotation, 1.0);

      expect(result.transform).toBeUndefined();
    });
  });

  describe('convertRewardsPosition', () => {
    const mockRewardsBounds: RewardsBounds = {
      centerX: 200,
      centerY: 150,
      width: 80,
      height: 60,
      rotation: -45
    };

    it('should convert center coordinates to top-left positioning', () => {
      const result = convertRewardsPosition(mockRewardsBounds, 1.5);

      expect(result).toEqual({
        left: 240,   // (200 * 1.5) - (80 * 1.5 / 2)
        top: 180,    // (150 * 1.5) - (60 * 1.5 / 2)
        width: 120,  // 80 * 1.5
        height: 90,  // 60 * 1.5
        transform: 'rotate(-45deg)'
      });
    });
  });

  describe('convertButtonPosition', () => {
    const mockButton: ButtonComponent = {
      position: { x: 150, y: 75 },
      stateStyles: {
        default: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#007bff' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: []
          },
          text: { fontSize: 16, color: '#ffffff' }
        },
        disabled: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#6c757d' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: []
          },
          text: { fontSize: 16, color: '#ffffff' }
        },
        hover: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#0056b3' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: []
          },
          text: { fontSize: 16, color: '#ffffff' }
        },
        active: {
          frame: {
            borderRadius: 4,
            backgroundFill: { type: 'solid', color: '#004085' },
            isAutolayout: false,
            layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
            padding: { vertical: 12, horizontal: 24 },
            dropShadows: []
          },
          text: { fontSize: 16, color: '#ffffff' }
        }
      }
    };

    it('should convert center coordinates with default dimensions', () => {
      const result = convertButtonPosition(mockButton, 2.0);

      expect(result).toEqual({
        left: 180,  // (150 * 2) - (120 * 2 / 2)
        top: 90,    // (75 * 2) - (60 * 2 / 2)
        width: 240, // 120 * 2
        height: 120 // 60 * 2
      });
    });

    it('should use custom dimensions when provided', () => {
      const result = convertButtonPosition(mockButton, 1.0, 100, 40);

      expect(result).toEqual({
        left: 100,  // 150 - (100 / 2)
        top: 55,    // 75 - (40 / 2)
        width: 100,
        height: 40
      });
    });
  });

  describe('convertFillToCSS', () => {
    it('should convert solid fill to CSS color', () => {
      const solidFill: Fill = {
        type: 'solid',
        color: '#ff0000'
      };

      expect(convertFillToCSS(solidFill)).toBe('#ff0000');
    });

    it('should handle solid fill without color', () => {
      const solidFill: Fill = {
        type: 'solid'
      };

      expect(convertFillToCSS(solidFill)).toBe('transparent');
    });

    it('should convert linear gradient to CSS', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          rotation: 45,
          stops: [
            { color: '#ff0000', position: 0 },
            { color: '#00ff00', position: 0.5 },
            { color: '#0000ff', position: 1 }
          ]
        }
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('linear-gradient(45deg, #ff0000 0.0%, #00ff00 50.0%, #0000ff 100.0%)');
    });

    it('should convert radial gradient to CSS', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'radial',
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#000000', position: 1 }
          ]
        }
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('radial-gradient(circle, #ffffff 0.0%, #000000 100.0%)');
    });

    it('should convert angular gradient to CSS', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'angular',
          rotation: 180,
          stops: [
            { color: '#red', position: 0 },
            { color: '#blue', position: 1 }
          ]
        }
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('conic-gradient(from 180deg, #red 0.0%, #blue 100.0%)');
    });

    it('should handle gradient without rotation', () => {
      const gradientFill: Fill = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          stops: [
            { color: '#000000', position: 0 },
            { color: '#ffffff', position: 1 }
          ]
        }
      };

      const result = convertFillToCSS(gradientFill);
      expect(result).toBe('linear-gradient(0deg, #000000 0.0%, #ffffff 100.0%)');
    });

    it('should return transparent for invalid fill', () => {
      const invalidFill: Fill = {
        type: 'gradient'
      };

      expect(convertFillToCSS(invalidFill)).toBe('transparent');
    });
  });

  describe('convertDropShadowsToCSS', () => {
    it('should convert single drop shadow to CSS', () => {
      const shadows: DropShadow[] = [
        {
          x: 2,
          y: 4,
          blur: 8,
          spread: 1,
          color: 'rgba(0,0,0,0.5)'
        }
      ];

      expect(convertDropShadowsToCSS(shadows)).toBe('2px 4px 8px 1px rgba(0,0,0,0.5)');
    });

    it('should convert multiple drop shadows to CSS', () => {
      const shadows: DropShadow[] = [
        { x: 1, y: 1, blur: 2, spread: 0, color: '#000000' },
        { x: 0, y: 4, blur: 8, spread: 2, color: 'rgba(0,0,0,0.3)' }
      ];

      const result = convertDropShadowsToCSS(shadows);
      expect(result).toBe('1px 1px 2px 0px #000000, 0px 4px 8px 2px rgba(0,0,0,0.3)');
    });

    it('should return none for empty array', () => {
      expect(convertDropShadowsToCSS([])).toBe('none');
    });

    it('should handle undefined shadows', () => {
      expect(convertDropShadowsToCSS(undefined as any)).toBe('none');
    });
  });

  describe('generateTransform', () => {
    it('should generate transform with rotation only', () => {
      expect(generateTransform(45)).toBe('rotate(45deg)');
    });

    it('should generate transform with scale only', () => {
      expect(generateTransform(undefined, 1.5)).toBe('scale(1.5)');
    });

    it('should generate transform with both rotation and scale', () => {
      expect(generateTransform(90, 2.0)).toBe('scale(2) rotate(90deg)');
    });

    it('should return none for no transforms', () => {
      expect(generateTransform()).toBe('none');
    });

    it('should ignore scale of 1', () => {
      expect(generateTransform(45, 1)).toBe('rotate(45deg)');
    });
  });

  describe('getResponsiveFontSize', () => {
    it('should scale font size correctly', () => {
      expect(getResponsiveFontSize(16, 2.0)).toBe(32);
    });

    it('should enforce minimum font size', () => {
      expect(getResponsiveFontSize(10, 0.5)).toBe(8); // minimum
    });

    it('should enforce maximum font size', () => {
      expect(getResponsiveFontSize(30, 2.0)).toBe(48); // maximum
    });

    it('should handle zero scale', () => {
      expect(getResponsiveFontSize(16, 0)).toBe(8); // minimum
    });

    it('should handle negative scale', () => {
      expect(getResponsiveFontSize(16, -1)).toBe(8); // minimum
    });
  });

  describe('getQuestStateColor', () => {
    it('should return correct colors for known states', () => {
      expect(getQuestStateColor('locked')).toBe('#666666');
      expect(getQuestStateColor('active')).toBe('#ffaa00');
      expect(getQuestStateColor('unclaimed')).toBe('#00aa00');
      expect(getQuestStateColor('completed')).toBe('#0066aa');
    });

    it('should return default color for unknown state', () => {
      expect(getQuestStateColor('invalid')).toBe('#999999');
      expect(getQuestStateColor('')).toBe('#999999');
    });
  });

  describe('getVerticalAlignment', () => {
    it('should convert alignment strings to CSS values', () => {
      expect(getVerticalAlignment('top')).toBe('flex-start');
      expect(getVerticalAlignment('center')).toBe('center');
      expect(getVerticalAlignment('bottom')).toBe('flex-end');
    });

    it('should be case insensitive', () => {
      expect(getVerticalAlignment('TOP')).toBe('flex-start');
      expect(getVerticalAlignment('Center')).toBe('center');
    });

    it('should return default for unknown values', () => {
      expect(getVerticalAlignment('invalid')).toBe('center');
      expect(getVerticalAlignment(undefined)).toBe('center');
    });
  });

  describe('getHorizontalAlignment', () => {
    it('should convert alignment strings to CSS values', () => {
      expect(getHorizontalAlignment('left')).toBe('flex-start');
      expect(getHorizontalAlignment('center')).toBe('center');
      expect(getHorizontalAlignment('right')).toBe('flex-end');
    });

    it('should be case insensitive', () => {
      expect(getHorizontalAlignment('LEFT')).toBe('flex-start');
      expect(getHorizontalAlignment('Center')).toBe('center');
    });

    it('should return default for unknown values', () => {
      expect(getHorizontalAlignment('invalid')).toBe('center');
      expect(getHorizontalAlignment(undefined)).toBe('center');
    });
  });
});
