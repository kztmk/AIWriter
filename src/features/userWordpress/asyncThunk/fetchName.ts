import { createAsyncThunk } from '@reduxjs/toolkit';
import type { WpName } from '../../../types';

const fetchName = createAsyncThunk<
  string,
  string,
  {
    rejectValue: string;
  }
>('targetWp/fetchName', async (url, thunkApi) => {
  try {
    const response = await fetch(`${url}/wp-json?_fields=name`, {
      method: 'GET',
    });
    const data: WpName = await response.json();
    if ('name' in data) {
      return data.name;
    }
    return thunkApi.rejectWithValue('Error: fetch name');
  } catch (error: any) {
    return thunkApi.rejectWithValue('Unknown Error: fetch name');
  }
});

export default fetchName;
