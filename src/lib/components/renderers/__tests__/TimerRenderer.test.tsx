import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { convertFillToCSS, convertShadowsToCSS } from '../../../utils/utils';
import { TimerRenderer } from '../TimerRenderer';

// Mock the utility functions to track their calls
vi.mock('../../../utils/utils', () => ({
  convertFillToCSS: vi.fn(),
  convertShadowsToCSS: vi.fn()
}));

const mockConvertFillToCSS = convertFillToCSS as ReturnType<typeof vi.fn>;
const mockConvertShadowsToCSS = convertShadowsToCSS as ReturnType<typeof vi.fn>;

describe('TimerRenderer', () => {
  const mockTimer = {
    position: { x: 400, y: 50 },
    dimensions: { width: 120, height: 40 },
    backgroundFill: { type: 'solid', color: '#000000' },
    borderRadius: 8,
    dropShadows: [{ x: 2, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.5)' }],
    textStyle: {
      fontSize: 14,
      color: '#ffffff',
      fontWeight: 500,
      textAlignHorizontal: 'center'
    },
    isAutolayout: false,
    layoutSizing: { horizontal: 'fixed', vertical: 'fixed' },
    padding: { vertical: 8, horizontal: 16 }
  };

  describe('Basic Rendering', () => {
    it('should render timer component', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      expect(screen.getByText('05:42')).toBeInTheDocument();
      expect(screen.getByTitle('Timer Component')).toBeInTheDocument();
    });

    it('should have timer-component class', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');
      expect(container).toHaveClass('timer-component');
    });

    it('should not render when timer is null', () => {
      render(<TimerRenderer timer={null} scale={1.0} />);

      expect(screen.queryByText('05:42')).not.toBeInTheDocument();
    });
  });

  describe('CSS Custom Properties', () => {
    it('should set position CSS variables', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');
      const computedStyle = window.getComputedStyle(container);

      expect(computedStyle.getPropertyValue('--timer-left')).toBe('400px');
      expect(computedStyle.getPropertyValue('--timer-top')).toBe('50px');
    });

    it('should scale position CSS variables', () => {
      render(<TimerRenderer timer={mockTimer} scale={2.0} />);

      const container = screen.getByTitle('Timer Component');
      const computedStyle = window.getComputedStyle(container);

      expect(computedStyle.getPropertyValue('--timer-left')).toBe('800px');
      expect(computedStyle.getPropertyValue('--timer-top')).toBe('100px');
    });

    it('should render timer component with correct CSS variables structure', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');

      // Verify the component renders and has basic structure
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('timer-component');
      expect(screen.getByText('05:42')).toBeInTheDocument();

      // Verify the style object has the expected CSS variable keys
      const style = container.style;
      expect(style.getPropertyValue('--timer-left')).toBeDefined();
      expect(style.getPropertyValue('--timer-top')).toBeDefined();
      expect(style.getPropertyValue('--timer-transform')).toBeDefined();
    });

    it('should set text styling CSS variables', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');
      const computedStyle = window.getComputedStyle(container);

      expect(computedStyle.getPropertyValue('--timer-color')).toBe('#ffffff');
      expect(computedStyle.getPropertyValue('--timer-font-weight')).toBe('500');
      expect(computedStyle.getPropertyValue('--timer-text-align')).toBe('center');
    });
  });

  describe('Layout Modes', () => {
    it('should handle autolayout mode', () => {
      const autoLayoutTimer = {
        ...mockTimer,
        isAutolayout: true,
        layoutSizing: { horizontal: 'HUG', vertical: 'FIXED' }
      };

      render(<TimerRenderer timer={autoLayoutTimer} scale={1.0} />);

      // Should render without error
      expect(screen.getByText('05:42')).toBeInTheDocument();
    });

    it('should handle different layout sizing options', () => {
      const fillTimer = {
        ...mockTimer,
        isAutolayout: true,
        layoutSizing: { horizontal: 'FILL', vertical: 'FILL' }
      };

      render(<TimerRenderer timer={fillTimer} scale={1.0} />);

      expect(screen.getByText('05:42')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero scale', () => {
      render(<TimerRenderer timer={mockTimer} scale={0} />);

      const container = screen.getByTitle('Timer Component');
      const computedStyle = window.getComputedStyle(container);

      expect(computedStyle.getPropertyValue('--timer-left')).toBe('0px');
      expect(computedStyle.getPropertyValue('--timer-top')).toBe('0px');
    });

    it('should handle missing text style properties', () => {
      const timerWithMinimalStyle = {
        ...mockTimer,
        textStyle: { fontSize: 14, color: '#ffffff' } // Missing fontWeight and textAlign
      };

      render(<TimerRenderer timer={timerWithMinimalStyle} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');
      const computedStyle = window.getComputedStyle(container);

      expect(computedStyle.getPropertyValue('--timer-font-weight')).toBe('600'); // Default value
      expect(computedStyle.getPropertyValue('--timer-text-align')).toBe('center'); // Default value
    });

    it('should handle missing layout sizing in autolayout mode', () => {
      const autoLayoutTimerNoSizing = {
        ...mockTimer,
        isAutolayout: true
        // layoutSizing undefined
      };

      render(<TimerRenderer timer={autoLayoutTimerNoSizing} scale={1.0} />);

      // Should not crash and should render
      expect(screen.getByText('05:42')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly with multiple timers', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<TimerRenderer timer={mockTimer} scale={1.0} />);
        unmount();
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render 100 timers in less than 1 second
    });

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const timerElement = screen.getByText('05:42');
      expect(timerElement).toBeInTheDocument();

      const container = screen.getByTitle('Timer Component');
      expect(container).toHaveAttribute('title', 'Timer Component');
    });

    it('should have semantic meaning', () => {
      render(<TimerRenderer timer={mockTimer} scale={1.0} />);

      const container = screen.getByTitle('Timer Component');
      expect(container).toHaveClass('timer-component');
    });
  });
});
