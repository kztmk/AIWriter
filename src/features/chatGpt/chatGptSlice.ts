import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type {
  ChatGptParams, Completion, CompletionErrorResponse, CompletionUsage,
} from '../../types/index';

import type { ChatGptParamsWithApiKey } from '../../components/chatPanel/ChatBase';

export const fetchChatGpt = createAsyncThunk<
{ completion:Completion, requestArgs:ChatGptParams },
ChatGptParamsWithApiKey,
{
  rejectValue: CompletionErrorResponse;
}
>('fetchChatGpt', async (args, thunkApi) => {
  try {
    const { chatGptApiKey, ...param } = args;

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatGptApiKey}`,
      },
      body: JSON.stringify({ ...param }),
    });
    const data = await response.json();
    if ('error' in data) {
      return thunkApi.rejectWithValue(data);
    }
    const usage: CompletionUsage = {
      promptTokens: data?.usage?.prompt_tokens,
      completionTokens: data?.usage?.completion_tokens,
      totalTokens: data?.usage?.totalTokens,
    };
    const complition = {
      completion: { ...data, usage },
      requestArgs: args,
    };
    return complition;
  } catch (er: any) {
    return thunkApi.rejectWithValue({
      error: {
        message: `Error: fetch chatGPT.${er?.message}`,
        code: er?.code,
        param: er?.param,
        type: er?.type,
      },
    });
  }
});

export type ChatGptResponse = {
  isLoading: boolean;
  isError: boolean;
  success: 'idle' | 'true' | 'error';
  error: CompletionErrorResponse;
  requestArgs: ChatGptParams;
  response: Completion;
};

const initialState: ChatGptResponse = {
  isLoading: false,
  isError: false,
  success: 'idle',
  error: {
    error: {
      message: '', type: '', param: null, code: null,
    },
  },
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
      state.response = action.payload.completion;
      state.requestArgs = action.payload.requestArgs;
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
export const { initializeChatGpt } = chatGptSlice.actions;
export default chatGptSlice.reducer;
