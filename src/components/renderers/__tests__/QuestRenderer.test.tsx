import { render, screen } from '@testing-library/react';
import React from 'react';
import { QuestlineProvider } from '../../../context/QuestlineContext';
import { Quest, QuestState } from '../../../types';
import { QuestRenderer } from '../QuestRenderer';

describe('QuestRenderer - Core Positioning Demo', () => {
  const mockQuest: Quest = {
    questKey: 'test-quest',
    stateBounds: {
      locked: { x: 60, y: 45, width: 100, height: 50 },
      active: { x: 67.5, y: 52.5, width: 105, height: 55 },
      unclaimed: { x: 75, y: 60, width: 110, height: 60 },
      completed: { x: 82.5, y: 67.5, width: 115, height: 65 }
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

  describe('Core Positioning System', () => {
    it('should render with x/y positioning converted to CSS variables', () => {
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

      // Verify the component exists with correct attributes
      const questElement = document.querySelector('[data-quest-key="test-quest"]');
      expect(questElement).toBeInTheDocument();
      expect(questElement).toHaveAttribute('data-quest-key', 'test-quest');
      expect(questElement).toHaveAttribute('data-quest-state', 'locked');
      expect(questElement).toHaveClass('quest-component');

      // Verify CSS variables are set correctly for x/y positioning
      // x=60, y=45, width=100, height=50, scale=2.0
      // left = (60 * 2.0) - (100 * 2.0 / 2) = 120 - 100 = 20
      // top = (45 * 2.0) - (50 * 2.0 / 2) = 90 - 50 = 40
      expect(questElement).toHaveStyle({
        '--quest-left': '20px',
        '--quest-top': '40px',
        '--quest-width': '200px',
        '--quest-height': '100px'
      });
    });

    it('should handle rotation in CSS variables', () => {
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
        '--quest-transform': 'rotate(45deg)'
      });
    });

    it('should update positioning when state changes', () => {
      let currentState: QuestState = 'locked';
      const { rerender } = render(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={currentState}
            questImage={mockQuestImages.locked}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      const questElement = document.querySelector('[data-quest-key="test-quest"]');

      // Initial position: locked bounds (x=60, y=45, width=100, height=50)
      // left = 60 - 100/2 = 10, top = 45 - 50/2 = 20
      expect(questElement).toHaveStyle({
        '--quest-left': '10px',
        '--quest-top': '20px',
        '--quest-width': '100px',
        '--quest-height': '50px'
      });

      // Re-render with active state (x=67.5, y=52.5, width=105, height=55)
      // left = 67.5 - 105/2 = 15, top = 52.5 - 55/2 = 25
      currentState = 'active';
      rerender(
        <TestWrapper>
          <QuestRenderer
            quest={mockQuest}
            currentState={currentState}
            questImage={mockQuestImages.active}
            scale={1.0}
            onCycleState={() => {}}
          />
        </TestWrapper>
      );

      expect(questElement).toHaveStyle({
        '--quest-left': '15px',
        '--quest-top': '25px',
        '--quest-width': '105px',
        '--quest-height': '55px'
      });
    });
  });

  describe('Image Handling', () => {
    it('should render image with correct attributes', () => {
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

      const image = screen.getByAltText('test-quest in locked visual state');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'blob:locked-image-url');
      expect(image).toHaveClass('quest-image');
      expect(image).toHaveAttribute('draggable', 'false');
    });

    it('should render empty image when no image provided', () => {
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

      // Should have an img element but with no src (pristine approach - show only what's there)
      const image = screen.getByAltText('test-quest in locked visual state');
      expect(image).toBeInTheDocument();
      expect(image).not.toHaveAttribute('src');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
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
      expect(questElement).toHaveAttribute('role', 'button');
      expect(questElement).toHaveAttribute('tabIndex', '0');
      expect(questElement).toHaveAttribute('aria-label', 'Quest test-quest - locked visual state');
      expect(questElement).toHaveAttribute('title', 'test-quest (locked) - Click to cycle states');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero scale gracefully', () => {
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
      expect(questElement).toBeInTheDocument();
      expect(questElement).toHaveStyle({
        '--quest-width': '0px',
        '--quest-height': '0px'
      });
    });

    it('should handle missing bounds gracefully', () => {
      const questWithMissingBounds: Quest = {
        ...mockQuest,
        stateBounds: {
          locked: { x: 0, y: 0, width: 0, height: 0 },
          active: { x: 0, y: 0, width: 0, height: 0 },
          unclaimed: { x: 0, y: 0, width: 0, height: 0 },
          completed: { x: 0, y: 0, width: 0, height: 0 }
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
        '--quest-width': '0px',
        '--quest-height': '0px'
      });
    });
  });
});
