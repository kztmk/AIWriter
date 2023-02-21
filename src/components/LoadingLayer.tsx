import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingLayer = (props: { open: boolean }) => {
  const { open } = props;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000000 }}>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        <CircularProgress sx={{ zIndex: 100000000 }} />
      </Backdrop>
    </Box>
  );
};

export default LoadingLayer;
