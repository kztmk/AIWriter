import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ErrorDialog from '../../components/ErrorDialog';
import LoadingLayer from '../../components/LoadingLayer';
import { resetPassword, selectFirebaseAuth } from '../../features/firebaseAuth/authSlice';

const schema = z.object({
  email: z.string().email(),
});

type ResetPasswordInputs = z.infer<typeof schema>;

const defaultlValues: ResetPasswordInputs = {
  email: '',
};

const ResetPassword = () => {
  const {
    isLoading, isError, success, error,
  } = useAppSelector(selectFirebaseAuth);
  const dispatch = useAppDispatch();

  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const errorObj = error ? { code: '', message: error } : { code: '', message: 'unkonw error.' };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    defaultValues: defaultlValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ResetPasswordInputs) => {
    dispatch(resetPassword({ email: data.email }));
  };

  useEffect(() => {
    if (isError) {
      setOpenErrorDialog(true);
    }
  }, [isError]);

  useEffect(() => {
    if (success === 'resetPassword') {
      alert('Password reset email sent. Please check your email.');
    }
  }, [success]);

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
        <Grid container component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, width: '50%' }}
              >
                Reset Password
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Link to="/">Back to Login</Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <LoadingLayer open={isLoading} />
      <ErrorDialog open={openErrorDialog} error={errorObj} onClose={closeErrorDialog} />
    </>
  );
};

export default ResetPassword;
