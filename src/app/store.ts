import { configureStore, combineReducers } from '@reduxjs/toolkit';
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

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export default store;
