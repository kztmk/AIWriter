import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { ChatGptLog } from './ChatPanel';

/**
 * Shows each chat
 * --prompt talk to ChatGPT
 * --completion reply from ChatGPT
 */
const ChatListItem = (props: { chatLog: ChatGptLog; showPrompt: boolean }) => {
  const { chatLog, showPrompt } = props;

  return (
    <Grid container>
      {showPrompt && (
        <Grid item xs={12}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              padding: '20px',
              borderRadius: '10px',
              color: '#ffffff',
              backgroundColor: '#0888ff',
              marginTop: '10px',
              marginLeft: '50px',
              boxShadow: '0px 0px 10px 0px #a7a7a7',
              '&:before': {
                content: "''",
                position: 'absolute',
                display: 'block',
                width: '0',
                height: '0',
                left: '-15px',
                top: '20px',
                borderRight: '15px solid #0888ff',
                borderTop: '15px solid transparent',
                borderBottom: '15px solid transparent',
              },
            }}
          >
            <AccountCircleIcon
              color="primary"
              fontSize="large"
              sx={{ position: 'absolute', left: '-60px', top: 15 }}
            />
            <Typography>{chatLog.prompt}</Typography>
          </Box>
        </Grid>
      )}
      <Grid item xs={12} sx={{ textAlign: 'right' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            padding: '12px 20px',
            borderRadius: '10px',
            color: '#000',
            backgroundColor: '#8bc34a',
            marginTop: '10px',
            marginRight: '50px',
            boxShadow: '0px 0px 10px 0px #a7a7a7',
            '&:before': {
              content: "''",
              position: 'absolute',
              display: 'block',
              width: '0',
              height: '0',
              right: '-15px',
              top: '8px',
              borderLeft: '15px solid #8bc34a',
              borderTop: '15px solid transparent',
              borderBottom: '15px solid transparent',
            },
          }}
        >
          <Badge
            color="warning"
            badgeContent={`Use tokens:${chatLog.totalTokens}`}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <PsychologyIcon
              fontSize="large"
              sx={{ position: 'absolute', right: '-60px', top: 15, color: '#8bc34a' }}
            />
          </Badge>
          <Typography>{chatLog.completion}</Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChatListItem;
