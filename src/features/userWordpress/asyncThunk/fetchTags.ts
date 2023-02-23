import { createAsyncThunk } from '@reduxjs/toolkit';
import { Tag } from '../../../types';

const fetchTags = createAsyncThunk<
Tag[],
string,
{
  rejectValue: string;
}
>('targetWp/fetchTags', async (url, thunkApi) => {
  try {
    const response = await fetch(`${url}/wp-json/wp/v2/tags`, {
      method: 'GET',
    });
    const data: Tag[] = await response.json();
    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue('Unknown Error: fetch tag');
  }
});

export default fetchTags;
