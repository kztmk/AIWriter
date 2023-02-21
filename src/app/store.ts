import { configureStore, combineReducers } from '@reduxjs/toolkit';
import firebaseAuthReducer from '../features/firebaseAuth/authSlice';

const rootReducer = combineReducers({
  firebaseAuth: firebaseAuthReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export default store;
