/* Manage user's WordPress List */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDatabase, push, ref, set, get } from 'firebase/database';
import type { RootState } from '../../app/store';
import { UserWordPress } from '../../types';
import { FirebaseAuthState } from '../firebaseAuth/authSlice';

export type UserWordPressList = {
  wordPressList: UserWordPress[];
};
const initialState: UserWordPressList = {
  wordPressList: [],
};

const wpSort = (a: UserWordPress, b: UserWordPress) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

export const fetchWordPressList = createAsyncThunk<
  UserWordPress[],
  void,
  {
    rejectValue: string;
    state: RootState;
  }
>('fetchWordPressList', async (_, thunkApi) => {
  try {
    const { user } = thunkApi.getState().firebaseAuth as FirebaseAuthState;
    const db = getDatabase();
    const dbRef = ref(db, `user-data/${user?.uid}/wordPressList`);
    const snapshot = await get(dbRef);
    const data = snapshot.val();
    const wpList: UserWordPress[] = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        wpList.push({
          ...data[key],
          id: key,
          posts: [],
          tags: [],
          categories: [],
        });
      });
    }
    return wpList;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const addWordPress = createAsyncThunk<
  UserWordPress,
  UserWordPress,
  {
    rejectValue: string;
    state: RootState;
  }
>('addWordPress', async (args, thunkApi) => {
  try {
    const { categories, tags, posts, ...rest } = args;
    const { user } = thunkApi.getState().firebaseAuth;
    const db = getDatabase();
    const dbRef = ref(db, `user-data/${user?.uid}/wordPressList`);
    const newWpRef = await push(dbRef);
    await set(newWpRef, { ...rest, id: newWpRef.key });

    const savedWp: UserWordPress = {
      categories: [],
      tags: [],
      posts: [],
      ...rest,
      id: newWpRef.key ?? '',
    };
    return savedWp;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const deleteWordPress = createAsyncThunk<
  string,
  string,
  {
    rejectValue: string;
    state: RootState;
  }
>('deleteWordPress', async (args, thunkApi) => {
  try {
    const db = getDatabase();
    const { user } = thunkApi.getState().firebaseAuth;
    await set(ref(db, `user-data/${user?.uid}/wordPressList/${args}`), null);
    return args;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

const wordPressListSlice = createSlice({
  name: 'wordPressList',
  initialState,
  reducers: {
    deleteWordPressdel: (state, { payload }: PayloadAction<UserWordPress>) => {
      const wpIndex = state.wordPressList.findIndex((wp) => wp.url === payload.url);
      if (wpIndex !== -1) {
        state.wordPressList.splice(wpIndex, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addWordPress.fulfilled, (state, { payload }) => {
      state.wordPressList.push(payload);
      state.wordPressList.sort(wpSort);
    });
    builder.addCase(deleteWordPress.fulfilled, (state, { payload }) => {
      const wpIndex = state.wordPressList.findIndex((wp) => wp.id === payload);
      if (wpIndex !== -1) {
        state.wordPressList.splice(wpIndex, 1);
      }
    });
    builder.addCase(fetchWordPressList.fulfilled, (state, { payload }) => {
      state.wordPressList = payload;
      state.wordPressList.sort(wpSort);
    });
  },
});

export const selectWordPressList = (state: RootState) => state.wordPressList;

export default wordPressListSlice.reducer;
