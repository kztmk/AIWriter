import { zodResolver } from '@hookform/resolvers/zod';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ErrorDialog from '../../components/ErrorDialog';
import LoadingLayer from '../../components/LoadingLayer';
import { selectFirebaseAuth, signIn } from '../../features/firebaseAuth/authSlice';
import { fetchSettings } from '../../features/settings/settingsSlice';
import { fetchWordPressList } from '../../features/userWordpress/wordPressListSlice';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean(),
});

type LoginFormInputs = z.infer<typeof schema>;

const defaultlValues: LoginFormInputs = {
  email: '',
  password: '',
  rememberMe: false,
};

/** Firebase  Email & password authentication form */
const Login = () => {
  const { isLoading, isError, error, success, user } = useAppSelector(selectFirebaseAuth);
  const dispatch = useAppDispatch();

  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const errorObj = error ? { code: error.code, message: error.message } : { code: '', message: '' };

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: defaultlValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    dispatch(signIn({ email: data.email, password: data.password }));
    if (data.rememberMe) {
      localStorage.setItem('loginInfo', JSON.stringify(data));
    } else {
      localStorage.removeItem('loginInfo');
    }
  };

  useEffect(() => {
    const loginInfo = localStorage.getItem('loginInfo');
    console.log(`loginInfo: ${loginInfo}`);
    if (loginInfo) {
      const { email, password, rememberMe } = JSON.parse(loginInfo);
      if (rememberMe) {
        setValue('email', email);
        setValue('password', password);
        setValue('rememberMe', true);
      }
    }
  }, []);

  useEffect(() => {
    if (isError) {
      setOpenErrorDialog(true);
    }
  }, [isError]);

  useEffect(() => {
    if (success === 'login') {
      dispatch(fetchWordPressList());
      dispatch(fetchSettings());
      navigate('/');
    }
  });

  const closeErrorDialog = () => {
    setOpenErrorDialog(false);
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '50%', minWidth: '350px', mx: 'auto' }}
      >
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </Box>
        </Grid>
        <Grid container component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="email"
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ margin: 2 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  type="password"
                  sx={{ margin: 2 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ marginTop: 3, marginBottom: 2, marginX: 2 }}
            >
              Sign In
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label="Save My info"
                    labelPlacement="end"
                    control={
                      <Checkbox
                        {...field}
                        id="rememberMe"
                        sx={{ margin: 2 }}
                        checked={field.value}
                      />
                    }
                  />
                )}
              />
              <Link to="/password-reset">Forgot password?</Link>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <LoadingLayer open={isLoading} />
      <ErrorDialog open={openErrorDialog} error={errorObj} onClose={closeErrorDialog} />
    </>
  );
};

export default Login;
