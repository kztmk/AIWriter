import { zodResolver } from '@hookform/resolvers/zod';
import KeyIcon from '@mui/icons-material/Key';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FaWordpress } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { z } from 'zod';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import fetchName from '../../features/userWordpress/asyncThunk/fetchName';
import fetchToken from '../../features/userWordpress/asyncThunk/fetchToken';
import { selectTargetWp } from '../../features/userWordpress/targetWpSlice';
import { addWordPress, selectWordPressList } from '../../features/userWordpress/wordPressListSlice';

const schema = z.object({
  url: z
    .string()
    .url({ message: 'Invalid url,check start with https://' })
    .startsWith('https://', 'Accepts only htts://')
    .transform((val) => val.replace(/\/$/, '')),
  userName: z.string().min(1, { message: 'User name is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type AddWordPressInputs = z.infer<typeof schema>;

const defaultValues: AddWordPressInputs = {
  url: '',
  userName: '',
  password: '',
};

/** Retrieve a JSON Web Token from WordPress using the provided URL, usrename, password.
 *  Success - Add to WordPress List.
 *  Fail - Show Error to Snackbar.
 */
const AddWordPress = () => {
  // dispatch
  const dispatch = useAppDispatch();
  const {
    isLoading, isError, error, success, targetWp,
  } = useAppSelector(selectTargetWp);
  const { wordPressList } = useAppSelector(selectWordPressList);

  // error dialog
  useEffect(() => {
    if (isError) {
      Swal.fire({
        title: 'Error!',
        html: `${error?.code}\n${error?.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }, [isError, error?.code, error?.message]);

  // navigatation
  const navigate = useNavigate();

  // success getToken and name
  useEffect(() => {
    if (success === 'token') {
      dispatch(fetchName(targetWp.url));
    }
    if (success === 'name') {
      Swal.close();
      dispatch(addWordPress(targetWp));
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  // for validate inputs using react-hook-form with zod
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddWordPressInputs>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  // form on submit
  const onSubmit: SubmitHandler<AddWordPressInputs> = async (data) => {
    // try to fetch token
    const isExist = wordPressList.find((wp) => wp.url === data.url);
    if (isExist === undefined) {
      await dispatch(fetchToken(data));
    } else {
      Swal.fire({
        title: 'Error!',
        html: `WordPress ${data.url} is already exist.`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // render form
  return (
    <Box
      sx={{
        mt: 8,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '50%',
        minWidth: '350px',
      }}
    >
      <Typography component="h2" variant="h5">
        Add WordPress
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ m: 1, width: '100%' }}>
        <Paper elevation={3} sx={{ margin: '20px', padding: '20px' }}>
          <Controller
            name="url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaWordpress />
                    </InputAdornment>
                  ),
                }}
                id="url"
                label="WordPress URL"
                error={!!errors.url}
                helperText={errors.url?.message}
                sx={{ mt: 4 }}
              />
            )}
          />
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
                id="userName"
                label="User name"
                error={!!errors.userName}
                helperText={errors.userName?.message}
                sx={{ mt: 4 }}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon />
                    </InputAdornment>
                  ),
                }}
                id="pasword"
                label="Password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mt: 4 }}
              />
            )}
          />
          <Box sx={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 4,
          }}
          >
            <Button type="submit" size="medium" variant="contained" color="primary">
              Add to List
            </Button>
            <Button
              size="medium"
              variant="contained"
              color="inherit"
              sx={{ ml: 2 }}
              onClick={() => reset()}
            >
              Reset
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddWordPress;
