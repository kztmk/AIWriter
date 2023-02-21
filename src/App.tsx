import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectFirebaseAuth, signOut } from './features/firebaseAuth/authSlice';
import Login from './pages/firebaseAuth/Login';
import ResetPassword from './pages/firebaseAuth/ResetPassword';
import Home from './pages/Home';

function App() {
  const { user } = useAppSelector(selectFirebaseAuth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user: FirebaseUser | null) => {
      if (!user) {
        dispatch(signOut());
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Routes>
      <Route path="/password-reset" element={<ResetPassword />} />
      <Route path="/" element={user ? <Home /> : <Navigate replace to="/login" />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
