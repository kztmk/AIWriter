import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectSettings, setSettings } from '../features/settings/settingsSlice';

const schema = z.object({
  chatGptApiKey: z.string().min(1, { message: 'ChatGPT APIKey is required.' }),
});

export type SettingsInputs = z.infer<typeof schema>;

const defaultValues: SettingsInputs = {
  chatGptApiKey: '',
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isError, settings, errorMessage } = useAppSelector(selectSettings);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SettingsInputs>({
    defaultValues: { ...defaultValues, ...settings },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (settings) {
      setValue('chatGptApiKey', settings.chatGptApiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: SubmitHandler<SettingsInputs> = (data) => {
    try {
      dispatch(setSettings(data));
      Swal.fire({
        title: 'Save Sccusess.',
        icon: 'success',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Something wrong!',
        icon: 'error',
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <Controller
          name="chatGptApiKey"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              id="chatGptApiKey"
              label="ChatGPT APIKey"
              error={!!errors.chatGptApiKey}
              helperText={errors.chatGptApiKey?.message}
              sx={{ mt: 4 }}
            />
          )}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <Button type="submit" size="medium" variant="contained" color="primary">
          Save
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
    </Box>
  );
};

export default Settings;
