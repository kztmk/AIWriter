import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChatGptParamsWithApiKey } from '../../components/chatPanel/ChatBase';
import { Completion, CompletionErrorResponse, CompletionUsage } from '../../types';
import { saveRequestArgs } from './chatGptSlice';

export const fetchChatGpt = createAsyncThunk<
  Completion,
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
    const complition: Completion = {
      ...data,
      usage: usage,
    };
    thunkApi.dispatch(saveRequestArgs(args));
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
