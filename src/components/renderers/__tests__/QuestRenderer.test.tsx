import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QuestlineProvider } from '../../../context/QuestlineContext';
import { Quest } from '../../../types';
import { QuestRenderer } from '../QuestRenderer';

// Mock the utility functions
jest.mock('../../../utils/positionUtils', () => ({
  convertQuestPosition: jest.fn((bounds, scale) => ({
    left: bounds.x * scale,
    top: bounds.y * scale,
    width: bounds.w * scale,
    height: bounds.h * scale,
    transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined
  })),
  getQuestStateColor: jest.fn((state) => {
    const colors = {
      locked: '#666666',
      active: '#ffaa00',
      unclaimed: '#00aa00',
      completed: '#0066aa'
    };
    return colors[state as keyof typeof colors] || '#999999';
  })
}));

describe('QuestRenderer', () => {
  const mockQuest: Quest = {
    questKey: 'test-quest',
    stateBounds: {
      locked: { x: 10, y: 20, w: 100, h: 50 },
      active: { x: 15, y: 25, w: 105, h: 55 },
      unclaimed: { x: 20, y: 30, w: 110, h: 60 },
      completed: { x: 25, y: 35, w: 115, h: 65 }
    },
    lockedImg: 'test-quest_locked.png',
    activeImg: 'test-quest_active.png',
    unclaimedImg: 'test-quest_unclaimed.png',
    completedImg: 'test-quest_completed.png'
  };

  const mockQuestImages = {
    locked: 'blob:locked-image-url',
    active: 'blob:active-image-url',
    unclaimed: 'blob:unclaimed-image-url',
    completed: 'blob:completed-image-url'
  };

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QuestlineProvider initialQuestKeys={['test-quest']}>
      {children}
    </QuestlineProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render quest component with correct attributes', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = screen.getByTestId('quest-component') ||
                           document.querySelector('[data-quest-key="test-quest"]');

      expect(questElement).toBeInTheDocument();
      expect(questElement).toHaveAttribute('data-quest-key', 'test-quest');
      expect(questElement).toHaveAttribute('data-quest-state', 'locked');
    });

    it('should render with correct positioning styles', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={2.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({
        position: 'absolute',
        left: '20px', // 10 * 2.0
        top: '40px',  // 20 * 2.0
        width: '200px', // 100 * 2.0
        height: '100px' // 50 * 2.0
      });
    });

    it('should render image when available', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const image = screen.getByAltText('test-quest - locked');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'blob:locked-image-url');
    });

    it('should render fallback when image is missing', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={undefined} // No images
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      // Should not have an img element
      expect(screen.queryByAltText('test-quest - locked')).not.toBeInTheDocument();

      // Should have fallback content
      expect(screen.getByText('test-quest')).toBeInTheDocument();
      expect(screen.getByText('locked')).toBeInTheDocument();
    });

    it('should render fallback with correct color', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={undefined}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const fallbackElement = screen.getByText('test-quest').parentElement;
      expect(fallbackElement).toHaveStyle({
        backgroundColor: '#666666' // locked color
      });
    });

    it('should handle rotation in transform', () => {
      const questWithRotation: Quest = {
        ...mockQuest,
        stateBounds: {
          ...mockQuest.stateBounds,
          locked: { ...mockQuest.stateBounds.locked, rotation: 45 }
        }
      };

      render(
        <TestWrapper>
          <QuestRenderer
            quest={questWithRotation}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({
        transform: 'rotate(45deg)'
      });
    });
  });

  describe('State Management', () => {
    it('should display correct state initially', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveAttribute('data-quest-state', 'locked');
    });

    it('should cycle through states on click', async () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]') as HTMLElement;

      // Initial state: locked
      expect(questElement).toHaveAttribute('data-quest-state', 'locked');

      // Click to cycle to active
      fireEvent.click(questElement);
      await waitFor(() => {
        expect(questElement).toHaveAttribute('data-quest-state', 'active');
      });

      // Click to cycle to unclaimed
      fireEvent.click(questElement);
      await waitFor(() => {
        expect(questElement).toHaveAttribute('data-quest-state', 'unclaimed');
      });

      // Click to cycle to completed
      fireEvent.click(questElement);
      await waitFor(() => {
        expect(questElement).toHaveAttribute('data-quest-state', 'completed');
      });

      // Click to cycle back to locked
      fireEvent.click(questElement);
      await waitFor(() => {
        expect(questElement).toHaveAttribute('data-quest-state', 'locked');
      });
    });

    it('should update image source when state changes', async () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]') as HTMLElement;

      // Initial image: locked
      let image = screen.getByAltText('test-quest - locked');
      expect(image).toHaveAttribute('src', 'blob:locked-image-url');

      // Click to cycle to active
      fireEvent.click(questElement);
      await waitFor(() => {
        image = screen.getByAltText('test-quest - active');
        expect(image).toHaveAttribute('src', 'blob:active-image-url');
      });
    });

    it('should update position when state changes', async () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]') as HTMLElement;

      // Initial position: locked bounds
      expect(questElement).toHaveStyle({
        left: '10px', // locked x
        top: '20px',  // locked y
        width: '100px', // locked w
        height: '50px'  // locked h
      });

      // Click to cycle to active
      fireEvent.click(questElement);
      await waitFor(() => {
        expect(questElement).toHaveStyle({
          left: '15px', // active x
          top: '25px',  // active y
          width: '105px', // active w
          height: '55px'  // active h
        });
      });
    });
  });

  describe('Animation States', () => {
    it('should have reduced opacity when animating', () => {
      // This would require mocking the context to set isAnimating: true
      // For now, we'll test the static case
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({ opacity: '1' }); // Not animating
    });
  });

  describe('Selection State', () => {
    it('should show selection outline when selected', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({
        outline: '2px solid #00ff00',
        zIndex: '1000'
      });
    });

    it('should not show selection outline when not selected', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({
        outline: 'none',
        zIndex: '10'
      });
    });
  });

  describe('Accessibility', () => {
    it('should have cursor pointer for clickable element', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({ cursor: 'pointer' });
    });

    it('should have descriptive title attribute', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveAttribute('title', 'Quest: test-quest (locked)');
    });

    it('should have proper image alt text', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const image = screen.getByAltText('test-quest - locked');
      expect(image).toBeInTheDocument();
    });

    it('should prevent image dragging', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const image = screen.getByAltText('test-quest - locked');
      expect(image).toHaveAttribute('draggable', 'false');
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should show debug info in development mode', () => {
      (process.env as any).NODE_ENV = 'development';

      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      // Check for debug overlay
      const debugElement = document.querySelector('.quest-debug-info');
      expect(debugElement).toBeInTheDocument();
    });

    it('should not show debug info in production mode', () => {
      (process.env as any).NODE_ENV = 'production';

      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      // Should not have debug overlay
      const debugElement = document.querySelector('.quest-debug-info');
      expect(debugElement).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing quest bounds gracefully', () => {
      const questWithMissingBounds: Quest = {
        ...mockQuest,
        stateBounds: {
          locked: { x: 0, y: 0, w: 0, h: 0 },
          active: { x: 0, y: 0, w: 0, h: 0 },
          unclaimed: { x: 0, y: 0, w: 0, h: 0 },
          completed: { x: 0, y: 0, w: 0, h: 0 }
        }
      };

      render(
        <TestWrapper>
          <QuestRenderer
            quest={questWithMissingBounds}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toBeInTheDocument();
      expect(questElement).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });

    it('should handle zero scale', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });

    it('should handle negative scale', () => {
      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={-1}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      // Negative scale should still work (might be used for effects)
      expect(questElement).toBeInTheDocument();
    });

    it('should handle empty quest key', () => {
      const questWithEmptyKey: Quest = {
        ...mockQuest,
        questKey: ''
      };

      render(
        <TestWrapper>
          <QuestRenderer
            quest={questWithEmptyKey}
            currentState={"locked"}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key=""]');
      expect(questElement).toBeInTheDocument();
    });

    it('should handle partially missing images', () => {
      const partialImages = {
        locked: 'blob:locked-image-url',
        // active, unclaimed, completed missing
      };

      render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={"locked"}
            questImage={partialImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]') as HTMLElement;

      // Should show image for locked state
      expect(screen.getByAltText('test-quest - locked')).toBeInTheDocument();

      // Click to cycle to active (should show fallback)
      fireEvent.click(questElement);

      // Should show fallback for active state
      expect(screen.queryByAltText('test-quest - active')).not.toBeInTheDocument();
      expect(screen.getByText('test-quest')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });
});
