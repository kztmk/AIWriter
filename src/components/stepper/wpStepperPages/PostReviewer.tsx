import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { WpPostStepperInputData, StepperProps } from '../WpPostStepper';
import { Controller, useForm } from 'react-hook-form';
import { useContext, useState } from 'react';
import { Category, Post, Tag, WpRestApiErrorResponse } from '../../../types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppDispatch } from '../../../app/hooks';
import { fetchPosts } from '../../../features/userWordpress/asyncThunk/fetchPosts';
import { PostsFilterArguments } from '../../PostsFilter';

interface PostWordPressFormParams {
  title: string;
  categories: Category | null;
  tags: Tag[];
}

const defaultlValues: PostWordPressFormParams = {
  title: '',
  categories: null,
  tags: [],
};

interface AddPostRequestParams {
  title: string;
  content: string;
  status: 'publish';
  excerpt: string;
  categories: number[];
  tags: number[];
}

const PostReviewer = (props: StepperProps & { setPublishedUrl: Function }) => {
  const { currentState, setCurrentState, targetWp } = useContext(WpPostStepperInputData);
  const { handleNext, handleBack, setPublishedUrl } = props;

  const [onPosting, setOnPosting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [postResult, setPostResult] = useState('');

  const { control, register, handleSubmit, reset } = useForm<PostWordPressFormParams>({
    defaultValues: defaultlValues,
  });

  const handlePost = (data: PostWordPressFormParams) => {
    let categoryNumber = [];
    if (data.categories) {
      categoryNumber.push(Number(data.categories.id));
    }
    let selectedTags = [];
    for (let i = 0; i < data.tags.length; i++) {
      selectedTags.push(Number(data.tags[i].id));
    }
    // parameters
    const postParams: AddPostRequestParams = {
      title: data.title,
      content: currentState.htmlForPost,
      excerpt: currentState.htmlForPost,
      categories: categoryNumber,
      tags: selectedTags,
      status: 'publish',
    };

    console.log(postParams);

    // post to wordPress
    createNewPost(postParams);
  };

  const createNewPost = async (postArgs: AddPostRequestParams) => {
    try {
      setOnPosting(true);
      const formData = new FormData();
      formData.append('title', postArgs.title);
      formData.append('content', postArgs.content);
      formData.append('excerpt', postArgs.excerpt);
      formData.append('status', postArgs.status);
      formData.append('categories', postArgs.categories.toString());
      formData.append('tags', postArgs.tags.toString());

      const response = await fetch(`${targetWp.url}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${targetWp.token}`,
        },
        body: formData,
      });
      const data: Post | WpRestApiErrorResponse = await response.json();
      setOnPosting(false);
      if ('id' in data) {
        // success
        const successMessage = `
          Post published.\n
          URL: ${data.link}
        `;
        setPostResult('Post Published Success!');
        setResultMessage(successMessage);
        setOpenDialog(true);
        setPublishedUrl(data.link);
      } else {
        // fail
        setPostResult('Error occurred.');
        setResultMessage(data.message);
        setOpenDialog(true);
      }
    } catch (error) {
      setOnPosting(false);
      setResultMessage('Error occurred on Uploading new post.');
      setOpenDialog(true);
    }
  };

  const PostingDialog = () => {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000000 }}
      >
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={onPosting}
        >
          <CircularProgress sx={{ zIndex: 100000000 }} />
        </Backdrop>
      </Box>
    );
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (postResult === 'Post Published Success!') {
      handleNext();
    }
  };

  const PostResultDialog = () => {
    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ zIndex: 100000 }}
      >
        <DialogTitle id="alert-dialog-title">{postResult}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{resultMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const onSubmit = (data: PostWordPressFormParams) => {
    handlePost(data);
  };

  return (
    <>
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h4">Post to:{targetWp.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} sx={{ marginY: 2 }}>
              <TextField label="title" fullWidth {...register('title')} />
            </Grid>
            <Grid item xs={6} sm={3} sx={{ marginRight: 2 }}>
              <Controller
                control={control}
                name="categories"
                defaultValue={null}
                render={({ field: { ref, onChange, ...field } }) => (
                  <Autocomplete
                    options={targetWp.categories}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, data) => onChange(data)}
                    defaultValue={null}
                    renderInput={(params) => (
                      <Stack direction="row">
                        <TextField
                          inputRef={ref}
                          {...params}
                          InputLabelProps={{ shrink: true }}
                          label="Category"
                        />
                      </Stack>
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3} spacing={2}>
              <Controller
                control={control}
                name="tags"
                defaultValue={[]}
                render={({ field: { ref, onChange, ...field } }) => (
                  <Autocomplete
                    options={targetWp.tags}
                    getOptionLabel={(option) => option.name}
                    multiple
                    onChange={(_, data) => onChange(data)}
                    defaultValue={[]}
                    renderInput={(params) => (
                      <Stack direction="row">
                        <TextField
                          inputRef={ref}
                          {...params}
                          InputLabelProps={{ shrink: true }}
                          label="Tags"
                        />
                      </Stack>
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justigyContent: 'flex-end' }}>
            <Button onClick={() => handleBack()} sx={{ mt: 3, ml: 1 }}>
              Back
            </Button>
            <Button onClick={() => reset()} sx={{ mt: 3, ml: 1 }}>
              Reset
            </Button>
            <Button type="submit" variant="contained" sx={{ mt: 3, ml: 1 }}>
              Post
            </Button>
          </Box>
        </form>
      </Box>
      <PostingDialog />
      <PostResultDialog />
    </>
  );
};

export default PostReviewer;
