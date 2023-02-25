import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import { WpRestApiErrorResponse, WordPressFetchParams, UserWordPress } from '../../types';
import fetchCategories from './asyncThunk/fetchCategories';
import fetchName from './asyncThunk/fetchName';
import fetchPosts from './asyncThunk/fetchPosts';
import fetchTags from './asyncThunk/fetchTags';
import fetchToken from './asyncThunk/fetchToken';

export const initialWp: UserWordPress = {
  id: '',
  url: '',
  userName: '',
  password: '',
  userEmail: '',
  displayName: '',
  token: '',
  tokenExpire: 0,
  tags: [],
  categories: [],
  name: '',
  posts: [],
};
const initialState: WordPressFetchParams = {
  targetWp: initialWp,
  isLoading: false,
  isError: false,
  success: 'idle',
  result: '',
  error: undefined,
};

export const error: WpRestApiErrorResponse = {
  code: '',
  data: { status: 0 },
  message: '',
};

const targetWpSlice = createSlice({
  name: 'targetWp',
  initialState,
  reducers: {
    setTargetWp: (state, action) => {
      state.targetWp.id = action.payload.id;
      state.targetWp.url = action.payload.url;
      state.targetWp.userName = action.payload.userName;
      state.targetWp.password = action.payload.password;
      state.targetWp.userEmail = action.payload.usreEmail;
      state.targetWp.displayName = action.payload.displayName;
      state.targetWp.token = action.payload.token;
      state.targetWp.tokenExpire = action.payload.tokenExpire;
      state.targetWp.tags = action.payload.tags;
      state.targetWp.categories = action.payload.categories;
      state.targetWp.name = action.payload.name;
      state.targetWp.posts = action.payload.posts;
      state.isLoading = false;
      state.isError = false;
      state.error = undefined;
      state.success = 'idle';
    },
    initializeWp: () => initialState,
  },
  extraReducers: (builder) => {
    // fetch token action
    builder.addCase(fetchToken.pending, (state) => {
      state.isLoading = true;
      state.success = 'idle';
    });
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      state.isLoading = false;
      state.targetWp = action.payload;
      state.success = 'token';
    });
    builder.addCase(fetchToken.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload as WpRestApiErrorResponse;
    });
    // fetch WordPress name
    builder.addCase(fetchName.pending, (state) => {
      state.isLoading = true;
      state.success = 'idle';
    });
    builder.addCase(fetchName.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = 'name';
      state.targetWp.name = action.payload;
    });
    builder.addCase(fetchName.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = { ...error, message: action.payload as string };
    });
    // fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.success = 'idle';
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.targetWp.categories = action.payload;
      state.success = 'category';
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = { ...error, message: action.payload as string };
    });
    // fetch tags
    builder.addCase(fetchTags.pending, (state) => {
      state.isLoading = true;
      state.success = 'idle';
    });
    builder.addCase(fetchTags.fulfilled, (state, action) => {
      state.isLoading = false;
      state.targetWp.tags = action.payload;
      state.success = 'tag';
    });
    builder.addCase(fetchTags.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = { ...error, message: action.payload as string };
    });
    builder.addCase(fetchPosts.pending, (state) => {
      state.isLoading = true;
      state.success = 'idle';
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = 'post';
      state.targetWp.posts = action.payload;
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = { ...error, message: action.payload as string };
    });
  },
});

export const selectTargetWp = (state: RootState) => state.targetWp;
export const { setTargetWp, initializeWp } = targetWpSlice.actions;
export default targetWpSlice.reducer;
