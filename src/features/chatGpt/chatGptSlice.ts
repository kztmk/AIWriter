import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { ChatGptParams, Completion, CompletionErrorResponse } from '../../types/index';
import { fetchChatGpt } from './fetchChatGpt';

export interface ChatGptResponse {
  isLoading: boolean;
  isError: boolean;
  success: 'idle' | 'true' | 'error';
  error: CompletionErrorResponse;
  requestArgs: ChatGptParams;
  response: Completion;
}

const initialState: ChatGptResponse = {
  isLoading: false,
  isError: false,
  success: 'idle',
  error: { error: { message: '', type: '', param: null, code: null } },
  requestArgs: { model: 'text-davinci-003', prompt: '', temperature: 1 },
  response: {
    id: '',
    object: '',
    created: 0,
    model: '',
    choices: [
      {
        text: '',
        index: 0,
        logprobs: null,
        finishReason: '',
      },
    ],
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  },
};

const chatGptSlice = createSlice({
  name: 'chatGpt',
  initialState,
  reducers: {
    saveRequestArgs: (state, action) => {
      state.requestArgs = action.payload;
    },
    initializeChatGpt() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatGpt.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchChatGpt.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = 'true';
      state.response = action.payload;
    });
    builder.addCase(fetchChatGpt.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      if (action.payload !== undefined) {
        state.error = action.payload;
      }
    });
  },
});

export const selectChatGpt = (state: RootState) => state.chatGpt;
export const { saveRequestArgs, initializeChatGpt } = chatGptSlice.actions;
export default chatGptSlice.reducer;
