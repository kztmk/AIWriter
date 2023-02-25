import { createContext, Dispatch } from 'react';
import { initialWp } from '../../features/userWordpress/targetWpSlice';
import { ChatGptLog, UserWordPress } from '../../types';

export type StepperData = {
  chatPanel: { chatLogs: ChatGptLog[]; showPrompt: boolean };
  editedHtml: string;
  htmlForPost: string;
};

export const initialStepData: StepperData = {
  chatPanel: { chatLogs: [], showPrompt: true },
  editedHtml: '',
  htmlForPost: '',
};

export type StepperProps = {
  activeStep: number;
  handleNext: () => void;
  handleBack: () => void;
};

export const WpPostStepperInputData = createContext<{
  currentState: StepperData;
  setCurrentState: Dispatch<StepperData>;
  targetWp: UserWordPress;
}>({
  currentState: initialStepData,
  setCurrentState: () => {},
  targetWp: initialWp,
});
