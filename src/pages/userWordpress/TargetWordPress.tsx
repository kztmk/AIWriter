import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import { TransitionProps } from '@mui/material/transitions/transition';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import PostsLine from '../../components/postsline/PostsLine';
import PostsFilter, { PostsFilterArguments } from '../../components/PostsFilter';
import WpPostStepper from '../../components/stepper/WpPostStepper';
import { selectTargetWp } from '../../features/userWordpress/targetWpSlice';
import { addWordPress } from '../../features/userWordpress/wordPressListSlice';
import { fetchPosts } from '../../features/userWordpress/asyncThunk/fetchPosts';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TargetWordPress: React.FC = () => {
  const { isLoading, isError, error, success, targetWp } = useAppSelector(selectTargetWp);
  const [openDialog, setOpenDialog] = useState(false);
  // redux dispatch
  const dispatch = useAppDispatch();

  // update List with refreshed categories or tags
  const updateWordPressList = () => {
    dispatch(addWordPress(targetWp));
  };

  useEffect(() => {
    if (success === 'category' || success === 'tag' || success === 'post') {
      Swal.close();
      updateWordPressList();
    }
  }, [success]);

  // rendering loading
  useEffect(() => {
    if (isLoading) {
      Swal.showLoading();
    }
  }, [isLoading]);

  // error dialog
  useEffect(() => {
    if (isError) {
      Swal.hideLoading();
      Swal.fire({
        title: 'Error!',
        html: `${error?.code}\n${error?.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }, [isError]);

  const wpPostStepperClosed = ({
    openStepper,
    finishState,
  }: {
    openStepper: boolean;
    finishState: 'success' | 'error' | 'suspension';
  }) => {
    if (!openStepper) {
      setOpenDialog(false);
    }
    if (finishState === 'success') {
      // fetch post data for reflresh postline
      const postsRequestParams: PostsFilterArguments = {
        url: targetWp.url,
        search: '',
        category: null,
        tags: [],
        from: null,
        to: null,
        orderby: 'date',
        order: true,
        page: 1,
      };
      dispatch(fetchPosts(postsRequestParams));
    }
  };

  if (targetWp.id === '') {
    return <h1>Select WordPress to create new post.</h1>;
  }

  return (
    <>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            px: 4,
          }}
        >
          <Tooltip title="Add Post">
            <Fab color="primary" onClick={() => setOpenDialog(true)}>
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        <PostsFilter targetWp={targetWp} />
        <PostsLine targetWp={targetWp} />
      </Box>
      <Dialog fullWidth maxWidth={'xl'} open={openDialog} TransitionComponent={Transition}>
        <Box>
          <WpPostStepper targetWp={targetWp} closeMe={wpPostStepperClosed} />
        </Box>
      </Dialog>
    </>
  );
};

export default TargetWordPress;
