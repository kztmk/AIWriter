import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

type ErrorDialogProps = {
  open: boolean;
  error: { code: string; message: string };
  onClose: () => void;
};

const ErrorDialog = (props: ErrorDialogProps) => {
  const { open, error, onClose } = props;

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ zIndex: 100000 }}
    >
      <DialogTitle id="alert-dialog-title">{`Error:${error.code}`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{error.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
