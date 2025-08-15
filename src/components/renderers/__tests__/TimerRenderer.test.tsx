import { render, screen } from '@testing-library/react';
import { TimerComponent } from '../../../types';
import { TimerRenderer } from '../TimerRenderer';

// Mock the utility functions
jest.mock('../../../utils/positionUtils', () => ({
  convertTimerPosition: jest.fn((timer, scale) => ({
    left: (timer.position.x * scale) - (timer.dimensions.width * scale / 2),
    top: (timer.position.y * scale) - (timer.dimensions.height * scale / 2),
    width: timer.dimensions.width * scale,
    height: timer.dimensions.height * scale
  })),
  convertFillToCSS: jest.fn((fill) => {
    if (fill.type === 'solid') return fill.color || 'transparent';
    return 'linear-gradient(0deg, #000 0%, #fff 100%)';
  }),
  convertDropShadowsToCSS: jest.fn((shadows) => {
    if (!shadows || shadows.length === 0) return 'none';
    return '2px 4px 8px rgba(0,0,0,0.5)';
  }),
  getResponsiveFontSize: jest.fn((baseFontSize, scale) => Math.max(8, Math.min(48, baseFontSize * scale)))
}));

describe('TimerRenderer', () => {
  const mockTimer: TimerComponent = {
    position: { x: 400, y: 50 },
    dimensions: { width: 120, height: 40 },
    borderRadius: 8,
    backgroundFill: { type: 'solid', color: '#000000' },
    isAutolayout: false,
    layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
    padding: { vertical: 8, horizontal: 16 },
    dropShadows: [
      { x: 2, y: 4, blur: 8, spread: 1, color: 'rgba(0,0,0,0.5)' }
    ],
    textStyle: {
      fontSize: 14,
      color: '#ffffff',
      fontWeight: 500,
      textAlignHorizontal: 'center',
      textAlignVertical: 'center'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render timer component with correct positioning', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const timerElement = screen.getByText('05:42');
      expect(timerElement).toBeInTheDocument();

      const container = timerElement.parentElement;
      expect(container).toHaveStyle({
        position: 'absolute',
        left: '340px', // 400 - (120/2)
        top: '30px',   // 50 - (40/2)
        width: '120px',
        height: '40px'
      });
    });

    it('should apply correct scaling', () => {
      render(<TimerRenderer timer={mockTimer} scale={2.0} />);

      const timerElement = screen.getByText('05:42');
      const container = timerElement.parentElement;

      expect(container).toHaveStyle({
        left: '280px', // (400 * 2) - (120 * 2 / 2)
        top: '-40px',  // (50 * 2) - (40 * 2 / 2)
        width: '240px', // 120 * 2
        height: '80px'  // 40 * 2
      });
    });

    it('should render default timer text', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      expect(screen.getByText('05:42')).toBeInTheDocument();
    });

    it('should apply background fill styling', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        background: '#000000'
      });
    });

    it('should apply border radius with scaling', () => {
      render(<TimerRenderer timer={mockTimer} scale={2.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        borderRadius: '16px' // 8 * 2
      });
    });

    it('should apply drop shadows', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        boxShadow: '2px 4px 8px rgba(0,0,0,0.5)'
      });
    });

    it('should handle no drop shadows', () => {
      const timerWithoutShadows: TimerComponent = {
        ...mockTimer,
        dropShadows: []
      };

      render(<TimerRenderer timer={timerWithoutShadows} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        boxShadow: 'none'
      });
    });
  });

  describe('Text Styling', () => {
    it('should apply text color', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toHaveStyle({
        color: '#ffffff'
      });
    });

    it('should apply responsive font size', () => {
      render(<TimerRenderer timer={mockTimer} scale={2.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toHaveStyle({
        fontSize: '28px' // Mocked to return scaled value
      });
    });

    it('should apply font weight', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toHaveStyle({
        fontWeight: '500'
      });
    });

    it('should apply text alignment', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toHaveStyle({
        textAlign: 'center'
      });
    });

    it('should center content with flexbox', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
    });
  });

  describe('Gradient Backgrounds', () => {
    it('should handle gradient background fills', () => {
      const timerWithGradient: TimerComponent = {
        ...mockTimer,
        backgroundFill: {
          type: 'gradient',
          gradient: {
            type: 'linear',
            rotation: 45,
            stops: [
              { color: '#ff0000', position: 0 },
              { color: '#0000ff', position: 1 }
            ]
          }
        }
      };

      render(<TimerRenderer timer={timerWithGradient} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        background: 'linear-gradient(0deg, #000 0%, #fff 100%)' // Mocked return
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero scale', () => {
      render(<TimerRenderer timer={mockTimer} scale={0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });

    it('should handle negative scale', () => {
      render(<TimerRenderer timer={mockTimer} scale={-1} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        width: '-120px',
        height: '-40px'
      });
    });

    it('should handle zero border radius', () => {
      const timerWithoutRadius: TimerComponent = {
        ...mockTimer,
        borderRadius: 0
      };

      render(<TimerRenderer timer={timerWithoutRadius} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        borderRadius: '0px'
      });
    });

    it('should handle missing text style properties', () => {
      const timerMinimalText: TimerComponent = {
        ...mockTimer,
        textStyle: {
          fontSize: 14,
          color: '#ffffff',
          fontWeight: 400,
          textAlignHorizontal: 'left',
          textAlignVertical: 'top'
        }
      };

      render(<TimerRenderer timer={timerMinimalText} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toHaveStyle({
        fontWeight: '400',
        textAlign: 'left'
      });
    });

    it('should handle very small dimensions', () => {
      const tinyTimer: TimerComponent = {
        ...mockTimer,
        dimensions: { width: 1, height: 1 }
      };

      render(<TimerRenderer timer={tinyTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        width: '1px',
        height: '1px'
      });
    });

    it('should handle very large dimensions', () => {
      const largeTimer: TimerComponent = {
        ...mockTimer,
        dimensions: { width: 1000, height: 500 }
      };

      render(<TimerRenderer timer={largeTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        width: '1000px',
        height: '500px'
      });
    });

    it('should handle extreme positions', () => {
      const extremeTimer: TimerComponent = {
        ...mockTimer,
        position: { x: -1000, y: 2000 }
      };

      render(<TimerRenderer timer={extremeTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveStyle({
        left: '-1060px', // -1000 - (120/2)
        top: '1980px'    // 2000 - (40/2)
      });
    });
  });

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      expect(textElement).toBeVisible();
      expect(textElement.textContent).toBe('05:42');
    });

    it('should have appropriate semantic structure', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toHaveClass('timer-component');
    });

    it('should maintain readability with high contrast', () => {
      const highContrastTimer: TimerComponent = {
        ...mockTimer,
        backgroundFill: { type: 'solid', color: '#000000' },
        textStyle: {
          ...mockTimer.textStyle,
          color: '#ffffff'
        }
      };

      render(<TimerRenderer timer={highContrastTimer} scale={1.0} />);

      const textElement = screen.getByText('05:42');
      const container = textElement.parentElement;

      expect(textElement).toHaveStyle({ color: '#ffffff' });
      expect(container).toHaveStyle({ background: '#000000' });
    });
  });

  describe('Performance', () => {
    it('should render quickly with multiple timers', () => {
      const start = performance.now();

      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<TimerRenderer timer={mockTimer} scale={1.0} />);
        unmount();
      }

      const end = performance.now();
      const renderTime = end - start;

      // Should render 10 timers in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Layout Modes', () => {
    it('should handle autolayout mode', () => {
      const autolayoutTimer: TimerComponent = {
        ...mockTimer,
        isAutolayout: true,
        layoutSizing: {
          horizontal: 'hug',
          vertical: 'hug'
        }
      };

      render(<TimerRenderer timer={autolayoutTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toBeInTheDocument();
      // Autolayout behavior would be implemented based on design requirements
    });

    it('should handle different layout sizing options', () => {
      const fillTimer: TimerComponent = {
        ...mockTimer,
        layoutSizing: {
          horizontal: 'fill',
          vertical: 'fixed'
        }
      };

      render(<TimerRenderer timer={fillTimer} scale={1.0} />);

      const container = screen.getByText('05:42').parentElement;
      expect(container).toBeInTheDocument();
    });
  });
});
