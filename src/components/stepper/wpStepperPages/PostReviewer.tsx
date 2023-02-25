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
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Category, Post, Tag, WpRestApiErrorResponse } from '../../../types';
import { StepperProps, WpPostStepperInputData } from '../WpPostStepperInputData';

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

const PostReviewer = (props: StepperProps & { setPublishedUrl: (url: string) => void }) => {
  const { currentState, targetWp } = useContext(WpPostStepperInputData);
  const { handleNext, handleBack, setPublishedUrl } = props;

  const [onPosting, setOnPosting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [postResult, setPostResult] = useState('');

  const { control, register, handleSubmit, reset } = useForm<PostWordPressFormParams>({
    defaultValues: defaultlValues,
  });

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

  const handlePost = (data: PostWordPressFormParams) => {
    const categoryNumber = [];
    if (data.categories) {
      categoryNumber.push(Number(data.categories.id));
    }
    const selectedTags = [];
    // eslint-disable-next-line no-plusplus
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

    // post to wordPress
    createNewPost(postParams);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (postResult === 'Post Published Success!') {
      handleNext();
    }
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
              <Typography variant="h4">
                Post to:
                {targetWp.name}
              </Typography>
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
                          {...field}
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
                          {...field}
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000000,
        }}
      >
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={onPosting}
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
    </>
  );
};

export default PostReviewer;
