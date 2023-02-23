import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import firebaseAuthReducer from '../features/firebaseAuth/authSlice';
import wordPressListReducer from '../features/userWordpress/wordPressListSlice';
import targetWpReducer from '../features/userWordpress/targetWpSlice';
import chatGptReducer from '../features/chatGpt/chatGptSlice';
import settingsReducer from '../features/settings/settingsSlice';

const rootReducer = combineReducers({
  firebaseAuth: firebaseAuthReducer,
  wordPressList: wordPressListReducer,
  targetWp: targetWpReducer,
  chatGpt: chatGptReducer,
  settings: settingsReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
    preloadedState,
  });
};

const store = setupStore({});

export type AppDispatch = AppStore['dispatch'];
export type AppStore = ReturnType<typeof setupStore>;
export default store;
