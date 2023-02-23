import SendIcon from '@mui/icons-material/Send';
import Autocomplete from '@mui/material/Autocomplete';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { initializeChatGpt, selectChatGpt } from '../../features/chatGpt/chatGptSlice';
import { fetchChatGpt } from '../../features/chatGpt/fetchChatGpt';
import { selectSettings } from '../../features/settings/settingsSlice';
import { ChatGptParams } from '../../types';

/** Chat GPT-3 Models */
const models = [
  { name: 'davinci', val: 'text-davinci-003' },
  { name: 'curie', val: 'text-curie-001' },
  { name: 'babbage', val: 'text-babbage-001' },
  { name: 'ada', val: 'text-ada-001' },
];

const maxTokensOptions = [256, 512, 1024, 2048, 4096];

/** Parameters of ChatGPT request */
export type ChatGptParamsWithApiKey = ChatGptParams & {
  chatGptApiKey: string;
};
const defaultValues: ChatGptParamsWithApiKey = {
  model: 'text-davinci-003',
  temperature: 1,
  prompt: '',
  chatGptApiKey: '',
};

/** Props
 * chat logs are managed by parent element.
 * this props(function) send each chat to parent.
 */
export type ChatBaseProps = {
  addChatLogs: Function;
};

/**
 * Provide chat form.
 */
const ChatBase: React.FC<ChatBaseProps> = (props) => {
  const { addChatLogs } = props;
  const { isLoading, isError, success, error, requestArgs, response } =
    useAppSelector(selectChatGpt);
  const dispatch = useAppDispatch();

  const { settings } = useAppSelector(selectSettings);
  const navigate = useNavigate();

  const { control, handleSubmit, reset, register, getValues } = useForm<ChatGptParamsWithApiKey>({
    defaultValues: { ...defaultValues, chatGptApiKey: settings?.chatGptApiKey },
  });

  const [openErrorDialog, setErrorOpenDialog] = useState(false);
  useEffect(() => {
    if (isError) {
      setErrorOpenDialog(true);
    }
  }, [isError]);

  useEffect(() => {
    if (success === 'true') {
      // add to chatlog managed by parent
      const totalTokens = response.usage?.promptTokens + response.usage?.completionTokens;
      addChatLogs({
        id: response.id,
        prompt: getValues('prompt'),
        completion: response.choices[0]?.text,
        totalTokens,
      });
      dispatch(initializeChatGpt());
      // reset form
      reset();
    }
  }, [success]);

  useEffect(() => {
    if (settings.chatGptApiKey.length === 0) {
      Swal.fire({
        title: 'ChatGPT required APIKey',
        icon: 'warning',
        text: 'Enter ChatGPT APIKey',
      });
      navigate('/settings');
    }
    dispatch(initializeChatGpt());
  }, []);

  const onSubmit = async (data: ChatGptParamsWithApiKey) => {
    await dispatch(initializeChatGpt());
    const selectedMaxTokens =
      typeof data.max_tokens === 'undefined' ? 4096 : (data.max_tokens as number);
    const promptLength =
      typeof data.prompt === 'undefined' ? 40 : (data.prompt as string).length * 4;
    const maxTokens = selectedMaxTokens - promptLength;
    await dispatch(fetchChatGpt({ ...data, max_tokens: maxTokens }));
  };

  const handleCloseErrorDialog = () => {
    dispatch(initializeChatGpt);
    setErrorOpenDialog(false);
    reset();
  };
  const ErrorDialog = () => {
    return (
      <Dialog
        open={openErrorDialog}
        onClose={handleCloseErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Error!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{error.error.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} autoFocus>
            I got it.
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress />
        </Backdrop>
      </Box>
      <ErrorDialog />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ marginTop: 3 }}>
        <Stack direction="row" sx={{ mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Controller
              control={control}
              name="model"
              defaultValue={'text-davinci-003'}
              render={({ field: { ref, onChange, ...field } }) => (
                <Autocomplete
                  options={models}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, data) => onChange(data)}
                  defaultValue={{ name: 'davinci', val: 'text-davinci-003' }}
                  renderInput={(params) => (
                    <TextField
                      inputRef={ref}
                      {...params}
                      InputLabelProps={{ shrink: true }}
                      label="model"
                      fullWidth
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flexGrow: 1, paddingRight: '25px' }}>
            <Controller
              control={control}
              name="temperature"
              defaultValue={100}
              render={({ field: { onChange, value, ...field } }) => (
                <FormControlLabel
                  label="Temperature"
                  labelPlacement="top"
                  sx={{ width: '100%' }}
                  control={<Slider defaultValue={100} onChange={onChange} {...field}></Slider>}
                />
              )}
            />
          </Box>
          <Box sx={{ flexGrow: 1, paddingLeft: 2 }}>
            <Controller
              control={control}
              name="max_tokens"
              defaultValue={2048}
              render={({ field: { ref, onChange, ...field } }) => (
                <Autocomplete
                  options={maxTokensOptions}
                  onChange={(_, data) => onChange(data)}
                  defaultValue={2048}
                  renderInput={(params) => (
                    <TextField
                      inputRef={ref}
                      {...params}
                      InputLabelProps={{ shrink: true }}
                      label="maxTokens"
                      fullWidth
                    />
                  )}
                />
              )}
            />
          </Box>
        </Stack>
        <Box sx={{ display: 'flex', spacing: 2 }}>
          <TextField
            label="Prompt"
            fullWidth
            multiline
            {...register('prompt')}
            sx={{ flexGrow: 1, paddingRight: '8px' }}
          />
          <Button type="submit" variant="contained" startIcon={<SendIcon />}>
            Send
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ChatBase;
