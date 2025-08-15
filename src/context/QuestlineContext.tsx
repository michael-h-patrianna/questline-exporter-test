import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AppState, ButtonState, HeaderState, QuestState, RewardsState } from '../types';

interface QuestlineContextValue {
  // State
  state: AppState;

  // Quest state management
  setQuestState: (questKey: string, state: QuestState) => void;
  cycleQuestState: (questKey: string) => void;

  // Header state management
  setHeaderState: (state: HeaderState) => void;
  cycleHeaderState: () => void;

  // Rewards state management
  setRewardsState: (state: RewardsState) => void;
  cycleRewardsState: () => void;

  // Button state management
  setButtonState: (state: ButtonState) => void;

  // Animation management
  setIsAnimating: (isAnimating: boolean) => void;
  finishAnimation: () => void;

  // Reset functionality
  resetAllStates: () => void;
}

const QuestlineContext = createContext<QuestlineContextValue | null>(null);

export function useQuestlineContext(): QuestlineContextValue {
  const context = useContext(QuestlineContext);
  if (!context) {
    throw new Error('useQuestlineContext must be used within a QuestlineProvider');
  }
  return context;
}

interface QuestlineProviderProps {
  children: ReactNode;
  initialQuestKeys?: string[];
}

export function QuestlineProvider({ children, initialQuestKeys = [] }: QuestlineProviderProps) {
  // Initialize quest states
  const initialQuestStates = initialQuestKeys.reduce((acc, questKey) => {
    acc[questKey] = 'locked';
    return acc;
  }, {} as Record<string, QuestState>);

  const [state, setState] = useState<AppState>({
    questStates: initialQuestStates,
    headerState: 'active',
    rewardsState: 'active',
    buttonState: 'default',
    isAnimating: false
  });

  // Quest state management
  const setQuestState = useCallback((questKey: string, newState: QuestState) => {
    setState(prev => ({
      ...prev,
      questStates: {
        ...prev.questStates,
        [questKey]: newState
      }
    }));
  }, []);

  const cycleQuestState = useCallback((questKey: string) => {
    const questStates: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];
    setState(prev => {
      const currentState = prev.questStates[questKey] || 'locked';
      const currentIndex = questStates.indexOf(currentState);
      const nextIndex = (currentIndex + 1) % questStates.length;
      const nextState = questStates[nextIndex];

      return {
        ...prev,
        questStates: {
          ...prev.questStates,
          [questKey]: nextState
        }
      };
    });
  }, []);

  // Header state management
  const setHeaderState = useCallback((newState: HeaderState) => {
    setState(prev => ({
      ...prev,
      headerState: newState
    }));
  }, []);

  const cycleHeaderState = useCallback(() => {
    const headerStates: HeaderState[] = ['active', 'success', 'fail'];
    setState(prev => {
      const currentIndex = headerStates.indexOf(prev.headerState);
      const nextIndex = (currentIndex + 1) % headerStates.length;
      return {
        ...prev,
        headerState: headerStates[nextIndex]
      };
    });
  }, []);

  // Rewards state management
  const setRewardsState = useCallback((newState: RewardsState) => {
    setState(prev => ({
      ...prev,
      rewardsState: newState
    }));
  }, []);

  const cycleRewardsState = useCallback(() => {
    const rewardsStates: RewardsState[] = ['active', 'fail', 'claimed'];
    setState(prev => {
      const currentIndex = rewardsStates.indexOf(prev.rewardsState);
      const nextIndex = (currentIndex + 1) % rewardsStates.length;
      return {
        ...prev,
        rewardsState: rewardsStates[nextIndex]
      };
    });
  }, []);

  // Button state management
  const setButtonState = useCallback((newState: ButtonState) => {
    setState(prev => ({
      ...prev,
      buttonState: newState
    }));
  }, []);

  // Animation management
  const setIsAnimating = useCallback((isAnimating: boolean) => {
    setState(prev => ({
      ...prev,
      isAnimating
    }));
  }, []);

  const finishAnimation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAnimating: false
    }));
  }, []);

  // Reset functionality
  const resetAllStates = useCallback(() => {
    setState(prev => ({
      ...prev,
      questStates: Object.keys(prev.questStates).reduce((acc, questKey) => {
        acc[questKey] = 'locked';
        return acc;
      }, {} as Record<string, QuestState>),
      headerState: 'active',
      rewardsState: 'active',
      buttonState: 'default',
      isAnimating: false
    }));
  }, []);

  const contextValue: QuestlineContextValue = {
    state,
    setQuestState,
    cycleQuestState,
    setHeaderState,
    cycleHeaderState,
    setRewardsState,
    cycleRewardsState,
    setButtonState,
    setIsAnimating,
    finishAnimation,
    resetAllStates
  };

  return (
    <QuestlineContext.Provider value={contextValue}>
      {children}
    </QuestlineContext.Provider>
  );
}
