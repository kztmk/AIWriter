import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Tooltip from '@mui/material/Tooltip';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { initializeWp, setTargetWp } from '../../features/userWordpress/targetWpSlice';
import {
  deleteWordPress,
  selectWordPressList,
} from '../../features/userWordpress/wordPressListSlice';

const WordPressList = () => {
  const { wordPressList } = useAppSelector(selectWordPressList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      renderCell: (params) => {
        const onClickInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          const currentRow = params.row;

          Swal.fire({
            title: currentRow.name,
            html: `<div style="text-align:left"><ul style="list-style:none;border-radius:8px;box-shadow: 0px 0px 5px slilver;padding: 0.5em 0.5em 0.5em 2em">
              <li>URL:${currentRow.url}</li>
              <li>User name: ${currentRow.userName}</li>
              <li>password: ${currentRow.password}</li>
              <li>User Email:${currentRow.userEmail}</li>
              <li>Display name:${currentRow.displayName}</li>
            </ul></div>`,
          });
        };

        const onClickPostAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation(); // don't select this row after clicking
          const currentRow = params.row;
          const wp = wordPressList.find((w) => w.id === currentRow.id);
          if (wp) {
            dispatch(setTargetWp(wp));
            navigate('/wordpress');
          } else {
            Swal.fire('Error!', 'Can not find WordPress from List.', 'error');
          }
        };

        const onClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation(); // don't select this row after clicking
          const currentRow = params.row;
          // delete confirm
          Swal.fire({
            title: 'Confirm delete?',
            text: 'Are you sure to delete this WordPress?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
          }).then((result) => {
            if (result.isConfirmed) {
              const wp = wordPressList.find((w) => w.id === currentRow.id);
              if (wp) {
                dispatch(deleteWordPress(wp.id));
                Swal.fire('Deleted!', 'This WordPress deleted from List.', 'success');
              } else {
                Swal.fire('Error!', 'Can not find WordPress from List.', 'error');
              }
            }
          });
        };
        // <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
        return (
          <ButtonGroup>
            <Tooltip title="Create new Post">
              <IconButton onClick={onClickPostAdd} sx={{ px: '2px' }}>
                <PostAddIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Show WordPress Info">
              <IconButton onClick={onClickInfo} sx={{ px: '2px' }}>
                <InfoIcon color="info" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete WordPress">
              <IconButton onClick={onClickDelete} sx={{ px: '2px' }}>
                <DeleteForeverIcon color="warning" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Title',
      width: 320,
    },
    {
      field: 'userName',
      headerName: 'User name',
      width: 120,
    },
    {
      field: 'url',
      headerName: 'URL',
      width: 320,
    },
  ];

  const addWordPress = () => {
    dispatch(initializeWp());
    navigate('/add_wordpress');
  };

  return (
    <>
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', spacing: 2,
      }}
      >
        <Tooltip title="Add WordPress">
          <Fab color="primary" onClick={addWordPress}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      {wordPressList.length === 0 ? (
        <div>WordPress List is emptyl</div>
      ) : (
        <Box>
          <DataGrid
            rows={wordPressList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
          />
        </Box>
      )}
    </>
  );
};

export default WordPressList;
