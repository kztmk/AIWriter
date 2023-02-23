import styled from '@emotion/styled';
import LoopIcon from '@mui/icons-material/Loop';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import { useAppDispatch } from '../app/hooks';
import az from '../assets/sort_asc.svg';
import za from '../assets/sort_desc.svg';
import { fetchCategories } from '../features/userWordpress/asyncThunk/fetchCategories';
import { fetchPosts } from '../features/userWordpress/asyncThunk/fetchPosts';
import { fetchTags } from '../features/userWordpress/asyncThunk/fetchTags';
import { Category, GetPostsRequestArguments, Tag, UserWordPress } from '../types';

const SortSwitch = styled(Switch)(({ theme }) => ({
  width: 100,
  height: 54,
  padding: 7,
  marginTop: 8,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      borderRadius: '50%',
      transform: 'translateX(52px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url(${za})`,
        backgroundSize: '40%',
        backgroundColor: '#00ffff',
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 42,
    height: 42,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      border: '2px solit #9c27b0',
      borderRadius: '50%',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: 'center',
      backgroundPositionY: '50%',
      backgroundImage: `url(${az})`,
      backgroundSize: '40%',
      backgroundColor: '#ea80fc',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    height: '18px',
    width: '80px',
    marginTop: '6px',
  },
}));

export type PostsFilterArguments = {
  url: string;
  search: string;
  category: Category | null;
  tags: Tag[];
  from: DateTime | null;
  to: DateTime | null;
  orderby: 'date' | 'title' | 'author';
  order: boolean;
  page: number;
};

const defaultValues: PostsFilterArguments = {
  url: '',
  search: '',
  category: null,
  tags: [],
  from: null,
  to: null,
  orderby: 'date',
  order: true,
  page: 1,
};

export type PostFilterProps = {
  targetWp: UserWordPress;
};

const PostsFilter = (props: PostFilterProps) => {
  const { targetWp } = props;

  // redux dispatch
  const dispatch = useAppDispatch();

  // fetch categories from wordpress
  const getCategory = async () => {
    await dispatch(fetchCategories(targetWp.url));
  };

  // fetch tags from wordpress
  const getTags = async () => {
    await dispatch(fetchTags(targetWp.url));
  };

  // fetch posts
  const getPosts = async (data: PostsFilterArguments) => {
    await dispatch(fetchPosts(data));
  };

  // first time rendering
  useEffect(() => {
    if (Object.keys(targetWp.categories).length === 0) {
      getCategory();
      getTags();
    }
    getPosts({ ...defaultValues, url: targetWp.url });
  }, []);

  // refresh category
  const handleReloadCategories = () => {
    getCategory();
  };

  // refuresh tags
  const handleReloadTags = () => {
    getTags();
  };

  const { control, handleSubmit, reset, register, getValues, setValue } =
    useForm<PostsFilterArguments>({
      defaultValues: { ...defaultValues, url: targetWp.url },
    });

  // form submit with validateion
  const onSubmit = (data: PostsFilterArguments) => {
    getPosts(data);
  };

  const isFuture = (date: DateTime | null): boolean => {
    if (date) {
      return date.diff(DateTime.now()).milliseconds < 0;
    }
    return true;
  };

  const invalidToDate = (date: DateTime | null): boolean => {
    /* 
      1. fromDate is null => true;
      2. toDate is null => true;
    */
    const fromDate = getValues('from');
    if (fromDate == null || date == null) return true;
    if (fromDate) {
      if (date.diff(fromDate).milliseconds < 0) {
        return false;
      }
    }
    return true;
  };

  const fetchPrev = () => {
    console.log('click prev 10');
    if (getValues('page') > 1) setValue('page', getValues('page') - 1);
    handleSubmit(onSubmit)();
  };

  const fetchNext = () => {
    console.log('click next 10');
    setValue('page', getValues('page') + 1);
    handleSubmit(onSubmit)();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ margin: 3, boxShadow: 1, borderRadius: 2 }}>
          <Card>
            <Box p={3} display="flex" justifyContent="center">
              <Typography variant="h5">{targetWp.name}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                px: 4,
              }}
            >
              <Typography variant="h5">Posts(all optional)</Typography>
            </Box>
            <Box sx={{ mx: 2, my: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid
                container
                rowSpacing={2}
                columnSpacing={{ xs: 1, sm: 2 }}
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12} sm={7}>
                  <TextField label="Search" fullWidth {...register('search')} />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Controller
                    control={control}
                    name="orderby"
                    defaultValue={'date'}
                    render={({ field: { ref, onChange, ...field } }) => (
                      <Autocomplete
                        options={['author', 'date', 'title']}
                        onChange={(_, data) => onChange(data)}
                        defaultValue={''}
                        renderInput={(params) => (
                          <TextField
                            inputRef={ref}
                            {...params}
                            InputLabelProps={{ shrink: true }}
                            label="OrderBy"
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller
                    control={control}
                    name="order"
                    defaultValue={true}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormControlLabel
                        label="Order"
                        labelPlacement="top"
                        control={<SortSwitch onChange={onChange} checked={value} {...field} />}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller
                    control={control}
                    name="category"
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
                            <IconButton onClick={handleReloadCategories}>
                              <LoopIcon />
                            </IconButton>
                          </Stack>
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
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
                            <IconButton onClick={handleReloadTags}>
                              <LoopIcon />
                            </IconButton>
                          </Stack>
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller
                    name="from"
                    defaultValue={null}
                    control={control}
                    rules={{
                      validate: {
                        isValid: (date) => date == null || date?.isValid || 'Invalid date',
                        isFuture: (date) => isFuture(date) || 'Enter past date',
                      },
                    }}
                    render={({ field: { ref, onBlur, name, ...restField }, fieldState }) => (
                      <DatePicker
                        {...restField}
                        inputRef={ref}
                        label="Post from"
                        renderInput={(inputProps) => (
                          <TextField
                            {...inputProps}
                            onBlur={onBlur}
                            name={name}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller
                    name="to"
                    defaultValue={null}
                    control={control}
                    rules={{
                      validate: {
                        isValid: (date) => date == null || date?.isValid || 'Invalid date',
                        isFuture: (date) => isFuture(date) || 'Enter past date',
                        invalidToDate: (date) =>
                          invalidToDate(date) || 'Enter future date than from',
                      },
                    }}
                    render={({ field: { ref, onBlur, name, ...restField }, fieldState }) => (
                      <DatePicker
                        {...restField}
                        inputRef={ref}
                        label="Post to"
                        renderInput={(inputProps) => (
                          <TextField
                            {...inputProps}
                            onBlur={onBlur}
                            name={name}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Button type="button" variant="outlined" onClick={() => reset()}>
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="success"
                    onClick={fetchPrev}
                    disabled={getValues('page') === 1}
                    startIcon={<ArrowBackIosNewIcon />}
                  >
                    Prev 10
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="success"
                    onClick={fetchNext}
                    sx={{ marginBottom: { xs: 2, sm: 2, md: 0 } }}
                    endIcon={<NavigateNextIcon />}
                  >
                    Next 10
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ marginBottom: { xs: 2, sm: 2, md: 0 } }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PostsFilter;
