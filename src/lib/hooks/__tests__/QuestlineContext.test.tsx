import { act, render, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { ButtonState, HeaderState, QuestState, RewardsState } from '../../types';
import { QuestlineProvider, useQuestlineContext } from '../QuestlineContext';

type QuestlineContextValue = ReturnType<typeof useQuestlineContext>;

describe('QuestlineContext', () => {
  describe('QuestlineProvider', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider>{children}</QuestlineProvider>
        )
      });

      expect(result.current.state).toEqual({
        questStates: {},
        headerState: 'active',
        rewardsState: 'active',
        buttonState: 'default',
        isAnimating: false
      });
    });

    it('should initialize with provided quest keys', () => {
      const initialQuestKeys = ['quest1', 'quest2', 'quest3'];

      const { result } = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={initialQuestKeys}>
            {children}
          </QuestlineProvider>
        )
      });

      expect(result.current.state.questStates).toEqual({
        quest1: 'locked',
        quest2: 'locked',
        quest3: 'locked'
      });
    });

    it('should handle empty initial quest keys', () => {
      const { result } = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={[]}>
            {children}
          </QuestlineProvider>
        )
      });

      expect(result.current.state.questStates).toEqual({});
    });
  });

  describe('useQuestlineContext hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useQuestlineContext());
      }).toThrow('useQuestlineContext must be used within a QuestlineProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Quest State Management', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={['quest1', 'quest2']}>
            {children}
          </QuestlineProvider>
        )
      });
    });

    describe('setQuestState', () => {
      it('should set quest state for existing quest', () => {
        act(() => {
          renderResult.result.current.setQuestState('quest1', 'active');
        });

        expect(renderResult.result.current.state.questStates.quest1).toBe('active');
        expect(renderResult.result.current.state.questStates.quest2).toBe('locked');
      });

      it('should set quest state for new quest', () => {
        act(() => {
          renderResult.result.current.setQuestState('quest3', 'completed');
        });

        expect(renderResult.result.current.state.questStates.quest3).toBe('completed');
      });

      it('should handle all valid quest states', () => {
        const questStates: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];

        questStates.forEach((state, index) => {
          act(() => {
            renderResult.result.current.setQuestState(`quest${index}`, state);
          });

          expect(renderResult.result.current.state.questStates[`quest${index}`]).toBe(state);
        });
      });
    });

    describe('cycleQuestState', () => {
      it('should cycle through quest states in correct order', () => {
        const expectedCycle: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];

        // Start with locked (default)
        expect(renderResult.result.current.state.questStates.quest1).toBe('locked');

        // Cycle through all states
        for (let i = 1; i < expectedCycle.length; i++) {
          act(() => {
            renderResult.result.current.cycleQuestState('quest1');
          });
          expect(renderResult.result.current.state.questStates.quest1).toBe(expectedCycle[i]);
        }

        // Should wrap back to locked
        act(() => {
          renderResult.result.current.cycleQuestState('quest1');
        });
        expect(renderResult.result.current.state.questStates.quest1).toBe('locked');
      });

      it('should cycle from any starting state', () => {
        // Set to unclaimed
        act(() => {
          renderResult.result.current.setQuestState('quest1', 'unclaimed');
        });

        // Cycle to completed
        act(() => {
          renderResult.result.current.cycleQuestState('quest1');
        });
        expect(renderResult.result.current.state.questStates.quest1).toBe('completed');

        // Cycle to locked
        act(() => {
          renderResult.result.current.cycleQuestState('quest1');
        });
        expect(renderResult.result.current.state.questStates.quest1).toBe('locked');
      });

      it('should handle quest that does not exist', () => {
        act(() => {
          renderResult.result.current.cycleQuestState('nonexistent');
        });

        // Should initialize to active (first cycle from default locked)
        expect(renderResult.result.current.state.questStates.nonexistent).toBe('active');
      });
    });
  });

  describe('Header State Management', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider>{children}</QuestlineProvider>
        )
      });
    });

    describe('setHeaderState', () => {
      it('should set header state', () => {
        act(() => {
          renderResult.result.current.setHeaderState('success');
        });

        expect(renderResult.result.current.state.headerState).toBe('success');
      });

      it('should handle all valid header states', () => {
        const headerStates: HeaderState[] = ['active', 'success', 'fail'];

        headerStates.forEach(state => {
          act(() => {
            renderResult.result.current.setHeaderState(state);
          });

          expect(renderResult.result.current.state.headerState).toBe(state);
        });
      });
    });

    describe('cycleHeaderState', () => {
      it('should cycle through header states in correct order', () => {
        const expectedCycle: HeaderState[] = ['active', 'success', 'fail'];

        // Start with active (default)
        expect(renderResult.result.current.state.headerState).toBe('active');

        // Cycle through all states
        for (let i = 1; i < expectedCycle.length; i++) {
          act(() => {
            renderResult.result.current.cycleHeaderState();
          });
          expect(renderResult.result.current.state.headerState).toBe(expectedCycle[i]);
        }

        // Should wrap back to active
        act(() => {
          renderResult.result.current.cycleHeaderState();
        });
        expect(renderResult.result.current.state.headerState).toBe('active');
      });
    });
  });

  describe('Rewards State Management', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider>{children}</QuestlineProvider>
        )
      });
    });

    describe('setRewardsState', () => {
      it('should set rewards state', () => {
        act(() => {
          renderResult.result.current.setRewardsState('claimed');
        });

        expect(renderResult.result.current.state.rewardsState).toBe('claimed');
      });

      it('should handle all valid rewards states', () => {
        const rewardsStates: RewardsState[] = ['active', 'fail', 'claimed'];

        rewardsStates.forEach(state => {
          act(() => {
            renderResult.result.current.setRewardsState(state);
          });

          expect(renderResult.result.current.state.rewardsState).toBe(state);
        });
      });
    });

    describe('cycleRewardsState', () => {
      it('should cycle through rewards states in correct order', () => {
        const expectedCycle: RewardsState[] = ['active', 'fail', 'claimed'];

        // Start with active (default)
        expect(renderResult.result.current.state.rewardsState).toBe('active');

        // Cycle through all states
        for (let i = 1; i < expectedCycle.length; i++) {
          act(() => {
            renderResult.result.current.cycleRewardsState();
          });
          expect(renderResult.result.current.state.rewardsState).toBe(expectedCycle[i]);
        }

        // Should wrap back to active
        act(() => {
          renderResult.result.current.cycleRewardsState();
        });
        expect(renderResult.result.current.state.rewardsState).toBe('active');
      });
    });
  });

  describe('Button State Management', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider>{children}</QuestlineProvider>
        )
      });
    });

    describe('setButtonState', () => {
      it('should set button state', () => {
        act(() => {
          renderResult.result.current.setButtonState('hover');
        });

        expect(renderResult.result.current.state.buttonState).toBe('hover');
      });

      it('should handle all valid button states', () => {
        const buttonStates: ButtonState[] = ['default', 'disabled', 'hover', 'active'];

        buttonStates.forEach(state => {
          act(() => {
            renderResult.result.current.setButtonState(state);
          });

          expect(renderResult.result.current.state.buttonState).toBe(state);
        });
      });
    });
  });

  describe('Animation Management', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider>{children}</QuestlineProvider>
        )
      });
    });

    describe('setIsAnimating', () => {
      it('should set animation state', () => {
        act(() => {
          renderResult.result.current.setIsAnimating(true);
        });

        expect(renderResult.result.current.state.isAnimating).toBe(true);

        act(() => {
          renderResult.result.current.setIsAnimating(false);
        });

        expect(renderResult.result.current.state.isAnimating).toBe(false);
      });
    });

    describe('finishAnimation', () => {
      it('should set isAnimating to false', () => {
        // First set to true
        act(() => {
          renderResult.result.current.setIsAnimating(true);
        });
        expect(renderResult.result.current.state.isAnimating).toBe(true);

        // Then finish animation
        act(() => {
          renderResult.result.current.finishAnimation();
        });
        expect(renderResult.result.current.state.isAnimating).toBe(false);
      });
    });
  });

  describe('Reset Functionality', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={['quest1', 'quest2']}>
            {children}
          </QuestlineProvider>
        )
      });
    });

    describe('resetAllStates', () => {
      it('should reset all states to defaults', () => {
        // Change all states from defaults
        act(() => {
          renderResult.result.current.setQuestState('quest1', 'completed');
          renderResult.result.current.setQuestState('quest2', 'active');
          renderResult.result.current.setHeaderState('fail');
          renderResult.result.current.setRewardsState('claimed');
          renderResult.result.current.setButtonState('hover');
          renderResult.result.current.setIsAnimating(true);
        });

        // Verify states are changed
        expect(renderResult.result.current.state.questStates.quest1).toBe('completed');
        expect(renderResult.result.current.state.questStates.quest2).toBe('active');
        expect(renderResult.result.current.state.headerState).toBe('fail');
        expect(renderResult.result.current.state.rewardsState).toBe('claimed');
        expect(renderResult.result.current.state.buttonState).toBe('hover');
        expect(renderResult.result.current.state.isAnimating).toBe(true);

        // Reset all states
        act(() => {
          renderResult.result.current.resetAllStates();
        });

        // Verify all states are reset to defaults
        expect(renderResult.result.current.state.questStates.quest1).toBe('locked');
        expect(renderResult.result.current.state.questStates.quest2).toBe('locked');
        expect(renderResult.result.current.state.headerState).toBe('active');
        expect(renderResult.result.current.state.rewardsState).toBe('active');
        expect(renderResult.result.current.state.buttonState).toBe('default');
        expect(renderResult.result.current.state.isAnimating).toBe(false);
      });

      it('should preserve quest keys when resetting', () => {
        // Add a new quest
        act(() => {
          renderResult.result.current.setQuestState('quest3', 'active');
        });

        // Reset
        act(() => {
          renderResult.result.current.resetAllStates();
        });

        // Original quests should still exist but be reset to locked
        expect(renderResult.result.current.state.questStates.quest1).toBe('locked');
        expect(renderResult.result.current.state.questStates.quest2).toBe('locked');

        // New quest should also be reset to locked
        expect(renderResult.result.current.state.questStates.quest3).toBe('locked');
      });
    });
  });

  describe('Concurrent State Updates', () => {
    let renderResult: { result: { current: QuestlineContextValue } };

    beforeEach(() => {
      renderResult = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={['quest1']}>
            {children}
          </QuestlineProvider>
        )
      });
    });

    it('should handle multiple rapid state updates', () => {
      act(() => {
        renderResult.result.current.setQuestState('quest1', 'active');
        renderResult.result.current.setHeaderState('success');
        renderResult.result.current.setRewardsState('fail');
        renderResult.result.current.setButtonState('hover');
        renderResult.result.current.setIsAnimating(true);
      });

      expect(renderResult.result.current.state.questStates.quest1).toBe('active');
      expect(renderResult.result.current.state.headerState).toBe('success');
      expect(renderResult.result.current.state.rewardsState).toBe('fail');
      expect(renderResult.result.current.state.buttonState).toBe('hover');
      expect(renderResult.result.current.state.isAnimating).toBe(true);
    });

    it('should handle cycling operations in sequence', () => {
      act(() => {
        renderResult.result.current.cycleQuestState('quest1'); // locked -> active
        renderResult.result.current.cycleHeaderState(); // active -> success
        renderResult.result.current.cycleRewardsState(); // active -> fail
      });

      expect(renderResult.result.current.state.questStates.quest1).toBe('active');
      expect(renderResult.result.current.state.headerState).toBe('success');
      expect(renderResult.result.current.state.rewardsState).toBe('fail');
    });
  });

  describe('Edge Cases', () => {
    it('should handle provider re-mounting with different initial quest keys', () => {
      const { rerender } = render(
        <QuestlineProvider initialQuestKeys={['quest1']}>
          <div>Test</div>
        </QuestlineProvider>
      );

      rerender(
        <QuestlineProvider initialQuestKeys={['quest2', 'quest3']}>
          <div>Test</div>
        </QuestlineProvider>
      );

      // New provider should have new quest keys
      const { result } = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={['quest2', 'quest3']}>
            {children}
          </QuestlineProvider>
        )
      });

      expect(result.current.state.questStates).toEqual({
        quest2: 'locked',
        quest3: 'locked'
      });
    });

    it('should handle undefined initial quest keys gracefully', () => {
      const { result } = renderHook(() => useQuestlineContext(), {
        wrapper: ({ children }) => (
          <QuestlineProvider initialQuestKeys={undefined as any}>
            {children}
          </QuestlineProvider>
        )
      });

      expect(result.current.state.questStates).toEqual({});
    });
  });
});
