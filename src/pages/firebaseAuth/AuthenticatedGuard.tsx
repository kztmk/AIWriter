import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectFirebaseAuth } from '../../features/firebaseAuth/authSlice';

const AuthenticatedGuard = () => {
  const { user } = useAppSelector(selectFirebaseAuth);
  const location = useLocation();
  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }
  return <Outlet />;
};

export default AuthenticatedGuard;
