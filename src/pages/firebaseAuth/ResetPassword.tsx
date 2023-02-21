import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetPassword, selectFirebaseAuth } from '../../features/firebaseAuth/authSlice';
import LoadingLayer from '../../components/LoadingLayer';
import ErrorDialog from '../../components/ErrorDialog';
import { useEffect, useState } from 'react';

const schema = z.object({
  email: z.string().email(),
});

type ResetPasswordInputs = z.infer<typeof schema>;

const defaultlValues: ResetPasswordInputs = {
  email: '',
};

const ResetPassword = () => {
  const { isLoading, isError, success, error, user } = useAppSelector(selectFirebaseAuth);
  const dispatch = useAppDispatch();

  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const errorObj = error ? { code: error.code, message: error.message } : { code: '', message: '' };

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
      <Grid container>
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
