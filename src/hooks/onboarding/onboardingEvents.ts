
import { TOTAL_TASKS } from "./onboardingStorage";

// Event names
export const ONBOARDING_EVENTS = {
  SEQUENCE_CREATED: 'pedagoia:sequenceCreated',
  EXERCISE_CREATED: 'pedagoia:exerciseCreated',
  DIFFERENTIATION_CREATED: 'pedagoia:differentiationCreated',
  CORRESPONDENCE_CREATED: 'pedagoia:correspondenceCreated',
  IMAGE_CREATED: 'pedagoia:imageCreated',
  FEATURE_REQUESTED: 'pedagoia:featureRequested',
};

// Setup event handlers for auto-completion
export const setupEventListeners = (
  completedTasks: boolean[],
  toggleTask: (index: number) => void
) => {
  const handleSequenceCreated = () => {
    if (!completedTasks[0]) toggleTask(0);
  };
  
  const handleExerciseCreated = () => {
    if (!completedTasks[1]) toggleTask(1);
  };
  
  const handleDifferentiationCreated = () => {
    if (!completedTasks[2]) toggleTask(2);
  };
  
  const handleCorrespondenceCreated = () => {
    if (!completedTasks[3]) toggleTask(3);
  };
  
  const handleImageCreated = () => {
    if (!completedTasks[4]) toggleTask(4);
  };
  
  const handleFeatureRequested = () => {
    if (!completedTasks[5]) toggleTask(5);
  };
  
  // Add event listeners
  window.addEventListener(ONBOARDING_EVENTS.SEQUENCE_CREATED, handleSequenceCreated);
  window.addEventListener(ONBOARDING_EVENTS.EXERCISE_CREATED, handleExerciseCreated);
  window.addEventListener(ONBOARDING_EVENTS.DIFFERENTIATION_CREATED, handleDifferentiationCreated);
  window.addEventListener(ONBOARDING_EVENTS.CORRESPONDENCE_CREATED, handleCorrespondenceCreated);
  window.addEventListener(ONBOARDING_EVENTS.IMAGE_CREATED, handleImageCreated);
  window.addEventListener(ONBOARDING_EVENTS.FEATURE_REQUESTED, handleFeatureRequested);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(ONBOARDING_EVENTS.SEQUENCE_CREATED, handleSequenceCreated);
    window.removeEventListener(ONBOARDING_EVENTS.EXERCISE_CREATED, handleExerciseCreated);
    window.removeEventListener(ONBOARDING_EVENTS.DIFFERENTIATION_CREATED, handleDifferentiationCreated);
    window.removeEventListener(ONBOARDING_EVENTS.CORRESPONDENCE_CREATED, handleCorrespondenceCreated);
    window.removeEventListener(ONBOARDING_EVENTS.IMAGE_CREATED, handleImageCreated);
    window.removeEventListener(ONBOARDING_EVENTS.FEATURE_REQUESTED, handleFeatureRequested);
  };
};
