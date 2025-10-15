/**
 * Quest State Management Hook
 *
 * Centralizes all questline component state management logic.
 * This hook handles the state cycling for all interactive questline components:
 * - Individual quest states (locked -> active -> unclaimed -> completed)
 * - Global header states (active -> success -> fail)
 * - Global rewards states (active -> fail -> unclaimed -> claimed)
 * - Button interaction states (default <-> hover <-> active <-> disabled)
 *
 * Purpose: Developers can study this file to understand how questline state
 * management works without needing to dig through rendering logic.
 */

import { useCallback, useState } from 'react';
import { ButtonState, HeaderState, QuestlineExport, QuestState, RewardsState } from '../types';

interface QuestlineComponentState {
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;
}

interface UseQuestlineStateReturn {
  // State getters
  questStates: Record<string, QuestState>;
  headerState: HeaderState;
  rewardsState: RewardsState;
  buttonState: ButtonState;

  // Quest state management
  getQuestState: (questKey: string) => QuestState;
  setQuestState: (questKey: string, state: QuestState) => void;
  cycleQuestState: (questKey: string) => void;

  // Component state management
  setHeaderState: (state: HeaderState) => void;
  cycleHeaderState: () => void;
  setRewardsState: (state: RewardsState) => void;
  cycleRewardsState: () => void;

  // Button state management (used for hover/click interactions)
  setButtonState: (state: ButtonState) => void;
  handleButtonMouseEnter: () => void;
  handleButtonMouseLeave: () => void;
  handleButtonClick: (onButtonClick?: () => void) => void;

  // Utility functions
  resetAllStates: () => void;
}

/**
 * State Cycling Orders - These define how components cycle through their states
 */
const QUEST_STATE_ORDER: QuestState[] = ['locked', 'active', 'unclaimed', 'completed'];
const HEADER_STATE_ORDER: HeaderState[] = ['active', 'success', 'fail'];
const REWARDS_STATE_ORDER: RewardsState[] = ['active', 'fail', 'claimed', 'unclaimed'];

/**
 * Initialize quest states from questline data
 * All quests start in 'locked' state by default
 */
function initializeQuestStates(questlineData: QuestlineExport): Record<string, QuestState> {
  const validQuests = Array.isArray(questlineData?.quests) ? questlineData.quests : [];

  return validQuests.reduce((acc, quest) => {
    if (quest?.questKey) {
      acc[quest.questKey] = 'locked';
    }
    return acc;
  }, {} as Record<string, QuestState>);
}

/**
 * Questline State Management Hook
 *
 * This hook encapsulates all state management logic for questline components.
 * It provides a clean API for managing quest progression, component states,
 * and user interactions.
 *
 * @param questlineData - The questline export data containing quest definitions
 * @returns Object with state values and state management functions
 */
export function useQuestlineState(questlineData: QuestlineExport): UseQuestlineStateReturn {

  // Initialize component state with safe defaults
  const [componentState, setComponentState] = useState<QuestlineComponentState>(() => ({
    questStates: initializeQuestStates(questlineData),
    headerState: 'active',
    rewardsState: 'active',
    buttonState: 'default'
  }));

  // Quest State Management Functions

  /**
   * Get the current state of a specific quest
   */
  const getQuestState = useCallback((questKey: string): QuestState => {
    return componentState.questStates[questKey] || 'locked';
  }, [componentState.questStates]);

  /**
   * Set a specific quest to a specific state
   */
  const setQuestState = useCallback((questKey: string, state: QuestState) => {
    setComponentState(prev => ({
      ...prev,
      questStates: {
        ...prev.questStates,
        [questKey]: state
      }
    }));
  }, []);

  /**
   * Cycle a quest through its state progression
   * locked -> active -> unclaimed -> completed -> locked (loops)
   */
  const cycleQuestState = useCallback((questKey: string) => {
    const currentState = getQuestState(questKey);
    const currentIndex = QUEST_STATE_ORDER.indexOf(currentState);
    const nextState = QUEST_STATE_ORDER[(currentIndex + 1) % QUEST_STATE_ORDER.length];

    setQuestState(questKey, nextState);
  }, [getQuestState, setQuestState]);

  // Header State Management Functions

  /**
   * Set the header component to a specific state
   */
  const setHeaderState = useCallback((state: HeaderState) => {
    setComponentState(prev => ({ ...prev, headerState: state }));
  }, []);

  /**
   * Cycle header through its state progression
   * active -> success -> fail -> active (loops)
   */
  const cycleHeaderState = useCallback(() => {
    const currentIndex = HEADER_STATE_ORDER.indexOf(componentState.headerState);
    const nextState = HEADER_STATE_ORDER[(currentIndex + 1) % HEADER_STATE_ORDER.length];
    setHeaderState(nextState);
  }, [componentState.headerState, setHeaderState]);

  // Rewards State Management Functions

  /**
   * Set the rewards component to a specific state
   */
  const setRewardsState = useCallback((state: RewardsState) => {
    setComponentState(prev => ({ ...prev, rewardsState: state }));
  }, []);

  /**
   * Cycle rewards through its state progression
   * active -> fail -> claimed -> active (loops)
   */
  const cycleRewardsState = useCallback(() => {
    const currentIndex = REWARDS_STATE_ORDER.indexOf(componentState.rewardsState);
    const nextState = REWARDS_STATE_ORDER[(currentIndex + 1) % REWARDS_STATE_ORDER.length];
    setRewardsState(nextState);
  }, [componentState.rewardsState, setRewardsState]);

  // Button State Management Functions

  /**
   * Set the button to a specific state
   */
  const setButtonState = useCallback((state: ButtonState) => {
    setComponentState(prev => ({ ...prev, buttonState: state }));
  }, []);

  /**
   * Handle mouse enter on button (default -> hover)
   */
  const handleButtonMouseEnter = useCallback(() => {
    if (componentState.buttonState === 'default') {
      setButtonState('hover');
    }
  }, [componentState.buttonState, setButtonState]);

  /**
   * Handle mouse leave on button (hover -> default)
   */
  const handleButtonMouseLeave = useCallback(() => {
    if (componentState.buttonState === 'hover') {
      setButtonState('default');
    }
  }, [componentState.buttonState, setButtonState]);

  /**
   * Handle button click with visual feedback
   * Shows 'active' state briefly, then returns to default
   */
  const handleButtonClick = useCallback((onButtonClick?: () => void) => {
    setButtonState('active');

    // Visual feedback: return to default state after brief delay
    setTimeout(() => {
      setButtonState('default');
    }, 150);

    // Execute external click handler if provided
    onButtonClick?.();
  }, [setButtonState]);

  // Utility Functions

  /**
   * Reset all component states to their initial values
   * Useful for testing or resetting questline progress
   */
  const resetAllStates = useCallback(() => {
    setComponentState({
      questStates: initializeQuestStates(questlineData),
      headerState: 'active',
      rewardsState: 'active',
      buttonState: 'default'
    });
  }, [questlineData]);

  return {
    // Current state values
    questStates: componentState.questStates,
    headerState: componentState.headerState,
    rewardsState: componentState.rewardsState,
    buttonState: componentState.buttonState,

    // Quest state management
    getQuestState,
    setQuestState,
    cycleQuestState,

    // Component state management
    setHeaderState,
    cycleHeaderState,
    setRewardsState,
    cycleRewardsState,

    // Button state management
    setButtonState,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    handleButtonClick,

    // Utilities
    resetAllStates
  };
}
