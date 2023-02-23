import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  User as FirebaseUser,
  AuthError,
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { RootState } from '../../app/store';

export type FirebaseAuthState = {
  user: FirebaseUser | null;
  isLoading: boolean;
  success: 'idle' | 'login' | 'resetPassword' | 'logout';
  isError: boolean;
  error?: string;
};

const initialState: FirebaseAuthState = {
  user: null,
  isLoading: false,
  success: 'idle',
  isError: false,
  error: undefined,
};

export const signIn = createAsyncThunk<
  FirebaseUser,
  { email: string; password: string },
  {
    rejectValue: string;
  }
>('signIn', async (args, thunkApi) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, args.email, args.password);
    return userCredential.user;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { email: string },
  {
    rejectValue: string;
  }
>('resetPassword', async (args, thunkApi) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, args.email);
    return;
  } catch (error: any) {
    // eslint-disable-next-line consistent-return
    return thunkApi.rejectWithValue(error.message);
  }
});

export const signOut = createAsyncThunk<
  void,
  void,
  {
    rejectValue: string;
  }
>('signOut', async (_, thunkApi) => {
  const auth = getAuth();
  try {
    await auth.signOut();
    return;
  } catch (error: any) {
    // eslint-disable-next-line consistent-return
    return thunkApi.rejectWithValue(error);
  }
});

const firebaseAuthSlice = createSlice({
  name: 'firebaseAuth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.success = 'idle';
      state.error = undefined;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = 'login';
      state.user = action.payload;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.success = 'idle';
      state.error = undefined;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
      state.success = 'resetPassword';
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.success = 'idle';
      state.error = undefined;
    });
    builder.addCase(signOut.fulfilled, (state) => initialState);
    builder.addCase(signOut.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });
  },
});

export const selectFirebaseAuth = (state: RootState) => state.firebaseAuth;

export default firebaseAuthSlice.reducer;
