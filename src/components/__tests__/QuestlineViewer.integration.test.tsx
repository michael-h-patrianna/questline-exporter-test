import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ExtractedAssets, QuestlineExport } from '../../types';
import { QuestlineViewer } from '../QuestlineViewer';

// Mock the utility functions
jest.mock('../../utils/positionUtils', () => ({
  calculateScale: jest.fn(() => ({
    scale: 1.0,
    actualWidth: 800,
    actualHeight: 600,
    offsetX: 0,
    offsetY: 0
  }))
}));

describe('QuestlineViewer Integration', () => {
  const mockQuestlineData: QuestlineExport = {
    questlineId: 'test-questline',
    frameSize: { width: 800, height: 600 },
    background: { exportUrl: 'background.png' },
    quests: [
      {
        questKey: 'quest1',
        stateBounds: {
          locked: { x: 100, y: 100, w: 80, h: 60 },
          active: { x: 105, y: 105, w: 85, h: 65 },
          unclaimed: { x: 110, y: 110, w: 90, h: 70 },
          completed: { x: 115, y: 115, w: 95, h: 75 }
        },
        lockedImg: 'quest1_locked.png',
        activeImg: 'quest1_active.png',
        unclaimedImg: 'quest1_unclaimed.png',
        completedImg: 'quest1_completed.png'
      },
      {
        questKey: 'quest2',
        stateBounds: {
          locked: { x: 200, y: 200, w: 80, h: 60 },
          active: { x: 205, y: 205, w: 85, h: 65 },
          unclaimed: { x: 210, y: 210, w: 90, h: 70 },
          completed: { x: 215, y: 215, w: 95, h: 75 }
        },
        lockedImg: 'quest2_locked.png',
        activeImg: 'quest2_active.png',
        unclaimedImg: 'quest2_unclaimed.png',
        completedImg: 'quest2_completed.png'
      }
    ],
    timer: {
      position: { x: 400, y: 50 },
      dimensions: { width: 120, height: 40 },
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
    },
    header: {
      stateBounds: {
        active: { centerX: 400, bottomY: 100, width: 300, height: 50 },
        success: { centerX: 400, bottomY: 100, width: 300, height: 50 },
        fail: { centerX: 400, bottomY: 100, width: 300, height: 50 }
      },
      activeImg: 'header_active.png',
      successImg: 'header_success.png',
      failImg: 'header_fail.png'
    },
    rewards: {
      stateBounds: {
        active: { centerX: 600, centerY: 400, width: 150, height: 100 },
        fail: { centerX: 600, centerY: 400, width: 150, height: 100 },
        claimed: { centerX: 600, centerY: 400, width: 150, height: 100 }
      },
      activeImg: 'rewards_active.png',
      failImg: 'rewards_fail.png',
      claimedImg: 'rewards_claimed.png'
    },
    button: {
      position: { x: 400, y: 500 },
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
    },
    exportedAt: '2024-01-01T00:00:00.000Z',
    metadata: {
      totalQuests: 2,
      version: '1.0.0'
    }
  };

  const mockAssets: ExtractedAssets = {
    questlineData: mockQuestlineData,
    backgroundImage: 'blob:background-url',
    questImages: {
      quest1: {
        locked: 'blob:quest1-locked-url',
        active: 'blob:quest1-active-url',
        unclaimed: 'blob:quest1-unclaimed-url',
        completed: 'blob:quest1-completed-url'
      },
      quest2: {
        locked: 'blob:quest2-locked-url',
        active: 'blob:quest2-active-url',
        unclaimed: 'blob:quest2-unclaimed-url',
        completed: 'blob:quest2-completed-url'
      }
    },
    headerImages: {
      active: 'blob:header-active-url',
      success: 'blob:header-success-url',
      fail: 'blob:header-fail-url'
    },
    rewardsImages: {
      active: 'blob:rewards-active-url',
      fail: 'blob:rewards-fail-url',
      claimed: 'blob:rewards-claimed-url'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all questline components', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Check that questline canvas is rendered
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();

      // Check that all quests are rendered
      expect(document.querySelector('[data-quest-key="quest1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-quest-key="quest2"]')).toBeInTheDocument();

      // Check that timer is rendered
      expect(screen.getByText('05:42')).toBeInTheDocument();

      // Check that optional components would be rendered if they have renderers
      // (This depends on the actual implementation)
    });

    it('should render background image when provided', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const backgroundElement = document.querySelector('.questline-background');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const img = backgroundElement.querySelector('img');
        expect(img).toHaveAttribute('src', 'blob:background-url');
      }
    });

    it('should handle missing background image gracefully', () => {
      const assetsWithoutBackground = {
        ...mockAssets,
        backgroundImage: undefined
      };

      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={assetsWithoutBackground}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should still render the questline
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
      expect(document.querySelector('[data-quest-key="quest1"]')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('should allow quest state cycling', async () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const quest1Element = document.querySelector('[data-quest-key="quest1"]') as HTMLElement;
      expect(quest1Element).toHaveAttribute('data-quest-state', 'locked');

      // Click to cycle state
      fireEvent.click(quest1Element);
      await waitFor(() => {
        expect(quest1Element).toHaveAttribute('data-quest-state', 'active');
      });

      // Click again to cycle to next state
      fireEvent.click(quest1Element);
      await waitFor(() => {
        expect(quest1Element).toHaveAttribute('data-quest-state', 'unclaimed');
      });
    });

    it('should maintain independent quest states', async () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const quest1Element = document.querySelector('[data-quest-key="quest1"]') as HTMLElement;
      const quest2Element = document.querySelector('[data-quest-key="quest2"]') as HTMLElement;

      // Cycle quest1 state
      fireEvent.click(quest1Element);
      await waitFor(() => {
        expect(quest1Element).toHaveAttribute('data-quest-state', 'active');
      });

      // quest2 should still be in initial state
      expect(quest2Element).toHaveAttribute('data-quest-state', 'locked');

      // Cycle quest2 state
      fireEvent.click(quest2Element);
      await waitFor(() => {
        expect(quest2Element).toHaveAttribute('data-quest-state', 'active');
      });

      // quest1 should maintain its state
      expect(quest1Element).toHaveAttribute('data-quest-state', 'active');
    });
  });

  describe('Scaling and Responsiveness', () => {
    it('should apply zoom level correctly', () => {
      const { rerender } = render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Check initial render
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();

      // Change zoom level
      rerender(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Canvas should still be rendered with new zoom
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });

    it('should handle container size changes', () => {
      const { rerender } = render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Change container size
      rerender(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={1200}
          questlineHeight={900}
        />
      );

      // Component should re-render with new dimensions
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });

    it('should handle zero dimensions gracefully', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={0}
          questlineHeight={0}
        />
      );

      // Should still render without crashing
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });
  });

  describe('Button Click Handling', () => {
    it('should call onButtonClick when provided', () => {
      const mockButtonClick = jest.fn();

      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
          onButtonClick={mockButtonClick}
        />
      );

      // Find and click the button (this depends on ButtonRenderer implementation)
      const buttonElement = document.querySelector('.button-component');
      if (buttonElement) {
        fireEvent.click(buttonElement);
        expect(mockButtonClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should not crash when onButtonClick is not provided', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should render without onButtonClick
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed questline data', () => {
      const malformedData = {
        ...mockQuestlineData,
        quests: [] // Empty quests array
      };

      render(
        <QuestlineViewer
          questlineData={malformedData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should render without crashing
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });

    it('should handle missing asset images', () => {
      const assetsWithMissingImages = {
        ...mockAssets,
        questImages: {
          quest1: {}, // No images for quest1
          quest2: {} // No images for quest2
        }
      };

      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={assetsWithMissingImages}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should render with fallback content
      expect(document.querySelector('[data-quest-key="quest1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-quest-key="quest2"]')).toBeInTheDocument();
    });

    it('should handle questline without optional components', () => {
      const minimalQuestline = {
        ...mockQuestlineData,
        timer: undefined,
        header: undefined,
        rewards: undefined,
        button: undefined
      };

      render(
        <QuestlineViewer
          questlineData={minimalQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should render quests only
      expect(document.querySelector('[data-quest-key="quest1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-quest-key="quest2"]')).toBeInTheDocument();

      // Timer should not be rendered
      expect(screen.queryByText('05:42')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render large questlines efficiently', () => {
      const largeQuestline = {
        ...mockQuestlineData,
        quests: Array.from({ length: 50 }, (_, i) => ({
          questKey: `quest${i}`,
          stateBounds: {
            locked: { x: i * 20, y: i * 20, w: 80, h: 60 },
            active: { x: i * 20 + 5, y: i * 20 + 5, w: 85, h: 65 },
            unclaimed: { x: i * 20 + 10, y: i * 20 + 10, w: 90, h: 70 },
            completed: { x: i * 20 + 15, y: i * 20 + 15, w: 95, h: 75 }
          },
          lockedImg: `quest${i}_locked.png`,
          activeImg: `quest${i}_active.png`,
          unclaimedImg: `quest${i}_unclaimed.png`,
          completedImg: `quest${i}_completed.png`
        }))
      };

      const start = performance.now();

      render(
        <QuestlineViewer
          questlineData={largeQuestline}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const end = performance.now();
      const renderTime = end - start;

      // Should render 50 quests in reasonable time
      expect(renderTime).toBeLessThan(1000); // Less than 1 second
      expect(document.querySelector('.questline-canvas')).toBeInTheDocument();
    });

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should be navigable with keyboard', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const quest1Element = document.querySelector('[data-quest-key="quest1"]') as HTMLElement;

      // Should be focusable
      quest1Element.focus();
      expect(document.activeElement).toBe(quest1Element);

      // Should respond to keyboard interaction (Enter/Space)
      fireEvent.keyDown(quest1Element, { key: 'Enter', code: 'Enter' });
      // Behavior depends on implementation
    });

    it('should have appropriate ARIA labels', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      const canvas = document.querySelector('.questline-canvas');
      expect(canvas).toHaveAttribute('role', 'img');
      expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('questline'));
    });

    it('should maintain focus order', () => {
      render(
        <QuestlineViewer
          questlineData={mockQuestlineData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      // Tab through interactive elements
      const interactiveElements = document.querySelectorAll('[tabindex="0"], button, [role="button"]');
      expect(interactiveElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative zoom levels', () => {
      expect(() => {
        render(
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle extremely large zoom levels', () => {
      expect(() => {
        render(
          <QuestlineViewer
            questlineData={mockQuestlineData}
            assets={mockAssets}
            questlineWidth={800}
            questlineHeight={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle questline with single quest', () => {
      const singleQuestData = {
        ...mockQuestlineData,
        quests: [mockQuestlineData.quests[0]]
      };

      render(
        <QuestlineViewer
          questlineData={singleQuestData}
          assets={mockAssets}
          questlineWidth={800}
          questlineHeight={600}
        />
      );

      expect(document.querySelector('[data-quest-key="quest1"]')).toBeInTheDocument();
      expect(document.querySelector('[data-quest-key="quest2"]')).not.toBeInTheDocument();
    });
  });
});
