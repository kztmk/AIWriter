import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get, getDatabase, ref, set } from 'firebase/database';

import type { RootState } from '../../app/store';

export type Settings = {
  chatGptApiKey: string;
};

export type SettingsState = {
  settings: Settings;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

const initialSettings: Settings = {
  chatGptApiKey: '',
};

const initialState = {
  settings: initialSettings,
  isLoading: false,
  isError: false,
  errorMessage: '',
};

export const setSettings = createAsyncThunk<
  Settings,
  Settings,
  {
    rejectValue: string;
    state: RootState;
  }
>('setSettings', async (args, thunkApi) => {
  try {
    const { user } = thunkApi.getState().firebaseAuth;
    const db = getDatabase();
    const dbRef = ref(db, `user-data/${user?.uid}/settings`);
    await set(dbRef, { ...args });

    return args;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const fetchSettings = createAsyncThunk<
  Settings,
  void,
  {
    rejectValue: string;
    state: RootState;
  }
>('fetchSettings', async (_, thunkApi) => {
  try {
    const { user } = thunkApi.getState().firebaseAuth;
    const db = getDatabase();
    const dbRef = ref(db, `user-data/${user?.uid}/settings`);
    const snapshot = await get(dbRef);
    const data = snapshot.val();
    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setSettings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload;
    });
    builder.addCase(setSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload as string;
    });
    builder.addCase(fetchSettings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload ?? initialSettings;
    });
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload as string;
    });
  },
});

export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer;
