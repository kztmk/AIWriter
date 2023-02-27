import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Suspense, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

import type { ChatGptLog } from '../../types';
import type { StepperProps } from '../stepper/WpPostStepperInputData';
import { WpPostStepperInputData } from '../stepper/WpPostStepperInputData';
import ChatBase from './ChatBase';
import ChatListItem from './ChatListItem';

/**
 * Provide Chatpanel
 *   -- chat screen(List of chatListItem)
 *   -- chat base
 */
const ChatPanel = (props: Partial<StepperProps>) => {
  const { currentState, setCurrentState } = useContext(WpPostStepperInputData);
  const { t } = useTranslation();
  const { handleNext } = props;
  const [chatLogs, setChatLogs] = useState<ChatGptLog[]>(currentState.chatPanel.chatLogs);
  const [showPrompt, setShowPrompt] = useState(currentState.chatPanel.showPrompt);
  const [showPromptLabel, setShowPromptLabel] = useState(t('chatPanel.promptON'));

  const addChatLogs = (chatlog: ChatGptLog) => {
    setChatLogs([...chatLogs, chatlog]);
  };

  const handleShowPrompt = () => {
    setShowPrompt(!showPrompt);
    const promptLabel = showPrompt ? t('chatPanel.promptON') : t('chatPanel.promptOFF');
    setShowPromptLabel(promptLabel);
  };

  const handleReset = () => {
    Swal.fire({
      title: t('chatPanel.resetDialogTitle') as string,
      html: t('chatPanel.resetDialogHtml') as string,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('chatPanel.resetDialogConfirm') as string,
      cancelButtonText: t('chatPanel.resetDialogCancel') as string,
    }).then((resutl) => {
      if (resutl.isConfirmed) {
        setChatLogs([]);
        Swal.fire('Reset complete', 'Chat logs cleard.', 'success');
      }
    });
  };

  const handleStepperNext = () => {
    if (handleNext) handleNext();
    setCurrentState({ ...currentState, chatPanel: { chatLogs, showPrompt } });
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          marginX: '16px',
          marginY: '8px',
          paddingRight: '24px',
          display: 'flex',
          direction: 'row',
          justifyContent: 'flex-end',
          alighnItems: 'center',
        }}
      >
        <FormControlLabel
          control={<Switch checked={showPrompt} onChange={handleShowPrompt} />}
          label={showPromptLabel}
          labelPlacement="end"
        />
        <Button
          type="button"
          onClick={handleReset}
          variant="contained"
          startIcon={<SettingsBackupRestoreIcon />}
        >
          {t('chatPanel.reset')}
        </Button>
      </Box>
      <Box
        sx={{
          minWidth: '450px',
          minHeight: '200px',
          maxHeight: '500px',
          padding: '8px',
        }}
      >
        <Box
          sx={{
            minWidth: '450px',
            minHeight: '200px',
            maxHeight: '450px',
            border: '2px solid #333',
            borderRadius: '5px',
            marginY: '16px',
            paddingX: '16px',
            overflow: 'auto',
          }}
        >
          {
            /* Chat screen */
            chatLogs.map((chatlog) => (
              <ChatListItem key={chatlog.id} chatLog={chatlog} showPrompt={showPrompt} />
            ))
          }
        </Box>
        <ChatBase addChatLogs={addChatLogs} />
      </Box>
      <Box sx={{ display: 'flex', justigyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleStepperNext} sx={{ mt: 3, ml: 1 }}>
          {t('stepperWp.buttonNext')}
        </Button>
      </Box>
    </>
  );
};

export default ChatPanel;
