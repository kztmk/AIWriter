import { createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '../../../types';

export const fetchCategories = createAsyncThunk<
  Category[],
  string,
  {
    rejectValue: string;
  }
>('targetWp/fetchCategories', async (url, thunkApi) => {
  try {
    const response = await fetch(`${url}/wp-json/wp/v2/categories`, {
      method: 'GET',
    });
    const data: Category[] = await response.json();
    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue('Unknown Error: fetch category');
  }
});
