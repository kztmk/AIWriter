import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import fetchToken from '../../features/userWordpress/asyncThunk/fetchToken';
import { selectTargetWp } from '../../features/userWordpress/targetWpSlice';
import type { StepperCloseProps } from '../../pages/userWordpress/TargetWordPress';
import ChatPanel from '../chatPanel/ChatPanel';
import PostEditor from './wpStepperPages/PostEditorTinyMce';
import PostReviewer from './wpStepperPages/PostReviewer';
import { initialStepData, WpPostStepperInputData } from './WpPostStepperInputData';

const steps = ['Generate Post', 'Edit Post', 'Set Title, category, tags'];

type PosterProps = {
  closeMe: ({ openStepper, finishState }: StepperCloseProps) => void;
};

/**
 * Creates a new post in WordPress using a 4-step process:
 *
 * 1. Create content using chatGPT.
 * 2. Edit the post, add images.
 * 3. Specify the post's title, category, and tags.
 * 4. Publish the post to make it live on the site.
 */
const WpPostStepper = (props: PosterProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentState, setCurrentState] = useState(initialStepData);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { closeMe } = props;
  const {
    isLoading, isError, error, success, targetWp,
  } = useAppSelector(selectTargetWp);
  const dispatch = useAppDispatch();
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    currentState,
    setCurrentState,
    targetWp,
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ChatPanel handleNext={handleNext} />;
      case 1:
        return (
          <PostEditor activeStep={activeStep} handleNext={handleNext} handleBack={handleBack} />
        );
      case 2:
        return (
          <PostReviewer
            activeStep={activeStep}
            handleNext={handleNext}
            handleBack={handleBack}
            setPublishedUrl={setPublishedUrl}
          />
        );
      default:
        throw new Error('Lost steps');
    }
  };

  useEffect(() => {
    // check targetWp token expiration
    if (targetWp.tokenExpire < DateTime.utc().minus({ day: 1 }).toMillis()) {
      // refresh token
      dispatch(fetchToken(targetWp));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (isError) {
      setOpenDialog(true);
    }
  }, [isError]);

  return (
    <Container component="main" sx={{ mb: 4 }}>
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', marginTop: 1, marginX: 2,
      }}
      >
        <IconButton onClick={() => closeMe({ openStepper: false, finishState: 'suspension' })}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Paper variant="outlined" sx={{ mb: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Publish new Post
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <>
            <Typography variant="h5" gutterBottom>
              Post successfully done.
            </Typography>
            <Typography variant="body1">
              <Link href={publishedUrl}>{publishedUrl}</Link>
            </Typography>

            <Button
              type="button"
              variant="contained"
              onClick={() => closeMe({ openStepper: false, finishState: 'success' })}
            >
              Finish
            </Button>
          </>
        ) : (
          <WpPostStepperInputData.Provider value={value}>
            {getStepContent(activeStep)}
          </WpPostStepperInputData.Provider>
        )}
      </Paper>
      <Box
        sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000000,
        }}
      >
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress sx={{ zIndex: 100000000 }} />
        </Backdrop>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ zIndex: 100000 }}
      >
        <DialogTitle id="alert-dialog-title">Error!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Error occurred when token renewal.\n
            {error?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WpPostStepper;
