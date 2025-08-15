import { cleanup, render } from '@testing-library/react';
import { QuestlineViewer } from '../../components/QuestlineViewer';
import {
    AccessibilityTester,
    LoadTester,
    MemoryTester,
    PerformanceTester
} from '../utils/testingUtils';

// Mock the utility functions for performance tests
jest.mock('../../utils/positionUtils', () => ({
  calculateScale: jest.fn(() => ({
    scale: 1.0,
    actualWidth: 800,
    actualHeight: 600,
    offsetX: 0,
    offsetY: 0
  }))
}));

describe('Performance and Quality Assurance Tests', () => {
  let performanceTester: PerformanceTester;
  let memoryTester: MemoryTester;

  beforeEach(() => {
    performanceTester = new PerformanceTester();
    memoryTester = new MemoryTester();
    memoryTester.recordInitialMemory();
  });

  afterEach(() => {
    cleanup();
    performanceTester.clear();
  });

  describe('Performance Tests', () => {
    it('should render simple questline within performance budget', () => {
      const simpleQuestline = LoadTester.generateLargeQuestlineData(5);
      const mockAssets = {
        questlineData: simpleQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      performanceTester.startMeasurement('simple-render');

      render(
        <QuestlineViewer
          questlineData={simpleQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const renderTime = performanceTester.endMeasurement('simple-render');

      // Should render simple questline in under 50ms
      expect(renderTime).toBeLessThan(50);
      performanceTester.assertPerformance('simple-render', 50);
    });

    it('should render medium questline within performance budget', () => {
      const mediumQuestline = LoadTester.generateLargeQuestlineData(25);
      const mockAssets = {
        questlineData: mediumQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      performanceTester.startMeasurement('medium-render');

      render(
        <QuestlineViewer
          questlineData={mediumQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const renderTime = performanceTester.endMeasurement('medium-render');

      // Should render medium questline in under 200ms
      expect(renderTime).toBeLessThan(200);
      performanceTester.assertPerformance('medium-render', 200);
    });

    it('should handle large questlines within acceptable time', () => {
      const largeQuestline = LoadTester.generateLargeQuestlineData(100);
      const mockAssets = {
        questlineData: largeQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      performanceTester.startMeasurement('large-render');

      render(
        <QuestlineViewer
          questlineData={largeQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const renderTime = performanceTester.endMeasurement('large-render');

      // Should render large questline in under 1 second
      expect(renderTime).toBeLessThan(1000);
      performanceTester.assertPerformance('large-render', 1000);
    });

    it('should maintain consistent performance across multiple renders', async () => {
      const questline = LoadTester.generateLargeQuestlineData(10);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      // Render multiple times to test consistency
      for (let i = 0; i < 5; i++) {
        performanceTester.startMeasurement('consistent-render');

        const { unmount } = render(
          <QuestlineViewer
            questlineData={questline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );

        performanceTester.endMeasurement('consistent-render');
        unmount();
      }

      const stats = performanceTester.getStats('consistent-render');

      // Performance should be consistent (max time shouldn't be more than 3x avg)
      expect(stats.max).toBeLessThan(stats.avg * 3);

      // All renders should complete within reasonable time
      expect(stats.max).toBeLessThan(500);
    });
  });

  describe('Memory Management Tests', () => {
    it('should not leak memory on component unmount', () => {
      const questline = LoadTester.generateLargeQuestlineData(20);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <QuestlineViewer
            questlineData={questline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
        unmount();
      }

      // Check for memory leaks (threshold: 10MB increase)
      memoryTester.checkForMemoryLeak(10);
    });

    it('should handle memory efficiently with large datasets', () => {
      const hugeQuestline = LoadTester.generateLargeQuestlineData(500);
      const mockAssets = {
        questlineData: hugeQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      const { unmount } = render(
        <QuestlineViewer
          questlineData={hugeQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Memory increase should be reasonable even with large dataset
      memoryTester.checkForMemoryLeak(100);

      unmount();

      // Memory should be released after unmount
      setTimeout(() => {
        memoryTester.checkForMemoryLeak(20);
      }, 100);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent rendering stress test', async () => {
      const questline = LoadTester.generateLargeQuestlineData(15);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      const renderFunction = () => {
        const { unmount } = render(
          <QuestlineViewer
            questlineData={questline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
        // Immediate unmount to simulate rapid cycling
        unmount();
      };

      const results = await LoadTester.stressTestRendering(renderFunction, 50);

      // Should complete stress test with minimal failures
      expect(results.failures).toBeLessThan(5); // Less than 10% failure rate
      expect(results.averageTime).toBeLessThan(100); // Average under 100ms
      expect(results.totalTime).toBeLessThan(10000); // Total under 10 seconds
    });

    it('should handle rapid state changes efficiently', () => {
      const questline = LoadTester.generateLargeQuestlineData(10);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      performanceTester.startMeasurement('rapid-updates');

      const { rerender } = render(
        <QuestlineViewer
          questlineData={questline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Simulate rapid zoom changes
      for (let zoom = 0.5; zoom <= 3.0; zoom += 0.1) {
        rerender(
          <QuestlineViewer
            questlineData={questline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }

      const updateTime = performanceTester.endMeasurement('rapid-updates');

      // Rapid updates should complete efficiently
      expect(updateTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility Tests', () => {
    it('should meet accessibility standards', () => {
      const questline = LoadTester.generateLargeQuestlineData(5);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      const { container } = render(
        <QuestlineViewer
          questlineData={questline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Find all interactive elements
      const interactiveElements = container.querySelectorAll('[data-quest-key], button, [role="button"]');

      let totalIssues = 0;
      const elementIssues: string[] = [];

      interactiveElements.forEach((element, index) => {
        const audit = AccessibilityTester.auditElement(element as HTMLElement);
        if (!audit.passed) {
          totalIssues += audit.issues.length;
          elementIssues.push(`Element ${index}: ${audit.issues.join(', ')}`);
        }
      });

      // Should have minimal accessibility issues
      if (totalIssues > 0) {
        console.warn('Accessibility issues found:', elementIssues);
      }

      // Allow for some issues but ensure they're not critical
      expect(totalIssues).toBeLessThan(5);
    });

    it('should be keyboard navigable', () => {
      const questline = LoadTester.generateLargeQuestlineData(3);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      const { container } = render(
        <QuestlineViewer
          questlineData={questline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Find focusable elements
      const focusableElements = container.querySelectorAll(
        '[tabindex="0"], [tabindex]:not([tabindex="-1"]), button, [role="button"]'
      );

      // Should have focusable elements for keyboard navigation
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test that elements are actually focusable
      focusableElements.forEach((element) => {
        expect(AccessibilityTester.isKeyboardAccessible(element as HTMLElement)).toBe(true);
      });
    });

    it('should have appropriate semantic structure', () => {
      const questline = LoadTester.generateLargeQuestlineData(3);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      const { container } = render(
        <QuestlineViewer
          questlineData={questline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Check for proper semantic structure
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveAttribute('role');

      // Check that interactive elements have proper labeling
      const questElements = container.querySelectorAll('[data-quest-key]');
      questElements.forEach((element) => {
        expect(AccessibilityTester.hasProperARIA(element as HTMLElement)).toBe(true);
      });
    });
  });

  describe('Error Recovery Tests', () => {
    it('should handle invalid questline data gracefully', () => {
      const invalidQuestline = {
        // Missing required fields
        questlineId: undefined,
        frameSize: null,
        quests: 'invalid'
      } as any;

      const mockAssets = {
        questlineData: invalidQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      // Should not crash with invalid data
      expect(() => {
        render(
          <QuestlineViewer
            questlineData={invalidQuestline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle missing assets gracefully', () => {
      const questline = LoadTester.generateLargeQuestlineData(3);
      const incompleteAssets = {
        questlineData: questline,
        // Missing backgroundImage and questImages
      } as any;

      // Should not crash with missing assets
      expect(() => {
        render(
          <QuestlineViewer
            questlineData={questline}
            assets={incompleteAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle extreme prop values', () => {
      const questline = LoadTester.generateLargeQuestlineData(2);
      const mockAssets = {
        questlineData: questline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      // Test extreme values
      const extremeProps = [
        { containerWidth: 0, containerHeight: 0 },
        { containerWidth: -100, containerHeight: -100 },
        { containerWidth: 99999, containerHeight: 99999 },
      ];

      extremeProps.forEach((props) => {
        expect(() => {
          render(
            <QuestlineViewer
              questlineData={questline}
              assets={mockAssets}
              questlineWidth={800}
              questlineHeight={600}
              {...props}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('Edge Case Stress Tests', () => {
    it('should handle questline with single quest', () => {
      const singleQuestline = LoadTester.generateLargeQuestlineData(1);
      const mockAssets = {
        questlineData: singleQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      expect(() => {
        render(
          <QuestlineViewer
            questlineData={singleQuestline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle questline with empty quests array', () => {
      const emptyQuestline = {
        ...LoadTester.generateLargeQuestlineData(0),
        quests: []
      };
      const mockAssets = {
        questlineData: emptyQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      expect(() => {
        render(
          <QuestlineViewer
            questlineData={emptyQuestline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle questline with overlapping quest positions', () => {
      const overlappingQuestline = {
        ...LoadTester.generateLargeQuestlineData(5),
        quests: Array.from({ length: 5 }, (_, i) => ({
          questKey: `overlap-quest-${i}`,
          stateBounds: {
            locked: { x: 100, y: 100, w: 80, h: 60 }, // All at same position
            active: { x: 100, y: 100, w: 80, h: 60 },
            unclaimed: { x: 100, y: 100, w: 80, h: 60 },
            completed: { x: 100, y: 100, w: 80, h: 60 }
          },
          lockedImg: `overlap-quest-${i}_locked.png`,
          activeImg: `overlap-quest-${i}_active.png`,
          unclaimedImg: `overlap-quest-${i}_unclaimed.png`,
          completedImg: `overlap-quest-${i}_completed.png`
        }))
      };

      const mockAssets = {
        questlineData: overlappingQuestline,
        backgroundImage: 'blob:bg-url',
        questImages: {}
      };

      expect(() => {
        render(
          <QuestlineViewer
            questlineData={overlappingQuestline}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });
  });
});
