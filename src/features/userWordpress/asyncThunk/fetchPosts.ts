import { createAsyncThunk } from '@reduxjs/toolkit';
import { PostsFilterArguments } from '../../../components/PostsFilter';
import { GetPostsRequestArguments, Post, WpRestApiErrorResponse } from '../../../types';
import { generateGetPostsEndpoint } from './generateParams';

export const fetchPosts = createAsyncThunk<
  Post[],
  PostsFilterArguments,
  {
    rejectValue: string;
  }
>('targetWp/fetchPosts', async (args, thunkApi) => {
  try {
    const url = `${args.url}/wp-json/wp/v2/posts?${generateGetPostsEndpoint(args)}`;
    console.log(url);
    const response = await fetch(url, {
      method: 'GET',
    });
    const data: Post[] | WpRestApiErrorResponse = await response.json();
    if ('code' in data) {
      const error = {
        code: data.code,
        data: { status: data.data?.status },
        message: data.message,
      };
      return thunkApi.rejectWithValue(error.message);
    }
    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue('Unknow Error: fetch posts');
  }
});
