import { configureStore, combineReducers } from '@reduxjs/toolkit';
import firebaseAuthReducer from '../features/firebaseAuth/authSlice';
import wordPressListReducer from '../features/userWordpress/wordPressListSlice';
import targetWpReducer from '../features/userWordpress/targetWpSlice';

const rootReducer = combineReducers({
  firebaseAuth: firebaseAuthReducer,
  wordPressList: wordPressListReducer,
  targetWp: targetWpReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export default store;
function getDefaultMiddleware(arg0: { serializableCheck: boolean }): any {
  throw new Error('Function not implemented.');
}
