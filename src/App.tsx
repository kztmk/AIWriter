import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from './app/hooks';
import AppDrawer from './components/navigation/AppDrawer';
import MenuBar from './components/navigation/MenuBar';
import { selectFirebaseAuth, signOut } from './features/firebaseAuth/authSlice';
import Login from './pages/firebaseAuth/Login';
import ResetPassword from './pages/firebaseAuth/ResetPassword';
import WordPressList from './pages/userWordpress/WordPressList';
import AddWordPress from './pages/userWordpress/AddWordPress';
import TargetWordPress from './pages/userWordpress/TargetWordPress';
import Settings from './pages/Settings';

const App = () => {
  const [open, setOpen] = useState(false);
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MenuBar open={open} openDrawer={setOpen} />
      <AppDrawer open={open} setOpen={setOpen} />
      <Box component="main" sx={{ mt: 8, flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/wordpress" element={<TargetWordPress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add_wordpress" element={<AddWordPress />} />
          <Route path="/password-reset" element={<ResetPassword />} />
          <Route path="/" element={user ? <WordPressList /> : <Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
