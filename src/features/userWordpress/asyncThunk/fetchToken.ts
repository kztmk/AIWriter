import { createAsyncThunk } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';
import { WpRestApiErrorResponse, JwtAuthResponse, UserWordPress } from '../../../types';
import { AddWordPressInputs } from '../../../pages/userWordpress/AddWordPress';
import { initialWp } from '../targetWpSlice';

const jwtAuthError: WpRestApiErrorResponse = {
  data: { status: 0 },
  message: '',
  code: '',
};

export const fetchToken = createAsyncThunk<
  UserWordPress,
  AddWordPressInputs,
  {
    rejectValue: WpRestApiErrorResponse;
  }
>('targetWp/fetchToken', async (wpAuthInfo, thunkApi) => {
  try {
    const response = await fetch(`${wpAuthInfo.url}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: wpAuthInfo.userName, password: wpAuthInfo.password }),
    });
    const data: JwtAuthResponse | WpRestApiErrorResponse = await response.json();
    if ('token' in data) {
      const tokenExp = DateTime.utc().plus({ day: 7 }).toMillis();

      const userWp: UserWordPress = {
        ...initialWp,
        ...wpAuthInfo,
        token: data.token,
        displayName: data.user_display_name,
        userEmail: data.user_email,
        tokenExpire: tokenExp,
      };

      return userWp;
    } else {
      if ('code' in data) {
        jwtAuthError.code = data.code;
      }
      if ('data' in data) {
        jwtAuthError.data.status = data.data.status ?? 0;
      }
      if ('message' in data) {
        jwtAuthError.message = data.message;
      }
      return thunkApi.rejectWithValue(jwtAuthError);
    }
  } catch (error: any) {
    jwtAuthError.message = 'Error: fetch token.';
    return thunkApi.rejectWithValue(jwtAuthError);
  }
});
