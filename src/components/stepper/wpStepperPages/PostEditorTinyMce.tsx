import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Editor } from '@tinymce/tinymce-react';
import { useContext, useRef, useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import { WpPostStepperInputData, StepperProps } from '../WpPostStepper';

const tinyMceContentStyle = `
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
}
.baloon_left {
  position: relative;
  max-width: 55%;
  background: #0099ff;
  margin: 8px;
  padding: 10px;
  text-align: left;
  color: #ffffff;
  font-size: 16px;
  border-radius: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
}
.baloon_left:after {
  border: solid transparent;
  content: '';
  height: 0;
  width: 0;
  pointer-events: none;
  position: absolute;
  border-color: rgba(0, 153, 255, 0);
  border-top-width: 10px;
  border-bottom-width: 10px;
  border-left-width: 10px;
  border-right-width: 10px;
  margin-top: -10px;
  border-right-color: #0099ff;
  right: 100%;
  top: 50%;
}
.completion {
  display:flex;
  justify-content:flex-end;
  align-items: end;
}
.baloon_right {
  position: relative;
  background: #8bc34a;
  margin: 8px;
  max-width: 55%;
  padding: 10px;
  color: #ffffff;
  font-size: 16px;
  border-radius: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
}
.baloon_right:after {
  border: solid transparent;
  content: '';
  height: 0;
  width: 0;
  pointer-events: none;
  position: absolute;
  border-color: rgba(139, 195, 74, 0);
  border-top-width: 10px;
  border-bottom-width: 10px;
  border-left-width: 10px;
  border-right-width: 10px;
  margin-top: -10px;
  border-left-color: #8bc34a;
  left: 100%;
  top: 50%;
}
`;

const PostEditorTinyMce = (props: StepperProps) => {
  const { currentState, setCurrentState, targetWp } = useContext(WpPostStepperInputData);
  const { handleNext, handleBack } = props;
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const [convertShortCode, setConvertShortCode] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  // use convert chatLogs to tinyMCE content
  const baloonLeftPrefix = `<!-- baloon-left-prefix --><div class="baloon_left">`;
  const baloonLeftSurfix = `</div><!-- baloon-left-surfix -->`;
  const baloonRightPrefix = `<!-- baloon-right-prefix --><div class="completion"><div class="baloon_right">`;
  const baloonRightSurfix = `</div></div><!-- baloon-right-surfix -->`;

  // Word Balloon left prefix
  const balloonLeftPrefix = `
      <!-- wp:word-balloon/word-balloon-block {"innerblocks_mode":false} -->
      <div class="wp-block-word-balloon-word-balloon-block">
        [word_balloon id="1" size="M" position="L" radius="true" name="" balloon="talk" balloon_shadow="true"]
        <p>`;

  // Word Balloon left sufix
  const balloonLeftSurfix = `</p>[/word_balloon]
      </div>
      <!-- /wp:word-balloon/word-balloon-block -->`;

  // Word Balloon right prefix
  const balloonRightPrefix = `
      <!-- wp:word-balloon/word-balloon-block
      {"avatar_id":"2","position":"R","name_position":"under_avatar","innerblocks_mode":false} -->
      <div class="wp-block-word-balloon-word-balloon-block">
        [word_balloon id="2" size="M" position="R" radius="true" name="" balloon="talk" balloon_shadow="true"]
        <p>`;

  // Word Balloon right surfix
  const balloonRightSurfix = `</p>
        [/word_balloon]
      </div>
      <!-- /wp:word-balloon/word-balloon-block -->`;

  // tinyMCE contents for first time
  let html = '';
  if (currentState.chatPanel.showPrompt) {
    html = currentState.chatPanel.chatLogs.reduce((chats: string, chat) => {
      return `${chats}${baloonLeftPrefix}${chat.prompt}${baloonLeftSurfix}
        ${baloonRightPrefix}${chat.completion}${baloonRightSurfix}`;
    }, '');
  } else {
    html = currentState.chatPanel.chatLogs.reduce((chats: string, chat) => {
      return `${chats}\n<p>${chat.completion}</p>`;
    }, '');
  }

  // convert WordPress Word Balloon plugin shortcode
  const convertToHtmlForPost = (currentHtml: string): string => {
    let replacedHtml = currentHtml.replace(/\n/g, '');
    // replace to Word Balloon left prefix
    const regxBlp = new RegExp(baloonLeftPrefix, 'g');
    replacedHtml = replacedHtml.replace(regxBlp, balloonLeftPrefix);
    // replace to Word Balloon left surfix
    const regxBls = new RegExp(baloonLeftSurfix, 'g');
    replacedHtml = replacedHtml.replace(regxBls, balloonLeftSurfix);
    // replace to Word Balloon right predix
    const regxBrp = new RegExp(baloonRightPrefix, 'g');
    replacedHtml = replacedHtml.replace(regxBrp, balloonRightPrefix);
    // replace to Word Balloon right surfix
    const regxBrs = new RegExp(baloonRightSurfix, 'g');
    replacedHtml = replacedHtml.replace(regxBrs, balloonRightSurfix);
    // replace spaces between tags
    replacedHtml = replacedHtml.replace(/\s{2,}/g, '');
    console.log(`replacedHTML:${replacedHtml}`);
    return replacedHtml;
  };

  const handlSteper = (action: string) => {
    if (editorRef.current) {
      const htmlForPost = convertToHtmlForPost(editorRef.current.getContent());
      // editedHtml as is tinyMCE screen keep it incase of back to this step.
      setCurrentState({ ...currentState, editedHtml: editorRef.current.getContent(), htmlForPost });
      if (action === 'back') {
        handleBack();
      } else {
        handleNext();
      }
    }
  };

  const ImageUploadingDialog = () => {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000000 }}
      >
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={uploading}
        >
          <CircularProgress sx={{ zIndex: 100000000 }} />
        </Backdrop>
      </Box>
    );
  };

  const handleCloseErrorDialog = () => {
    setOpenErrorDialog(false);
  };

  const ErrorDialog = () => {
    return (
      <Dialog
        open={openErrorDialog}
        onClose={handleCloseErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ zIndex: 999999 }}
      >
        <DialogTitle id="alert-dialog-title">Error!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleImageUpload = async (file: any, success: Function, failure: Function) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await fetch(`${targetWp.url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${targetWp.token}`,
        },
        body: formData,
      });

      setUploading(false);

      const data = await response.json();

      return success(data.source_url);
    } catch (error) {
      setUploading(false);
      failure('Image upload failed');
    }
  };

  const handleFilePicker = (callback: Function, value: any, meta: any) => {
    if (meta.filetype === 'image') {
      let input = document.getElementById('img-file') as HTMLInputElement;
      if (!input) return;
      input.click();
      input.onchange = function () {
        let file = (input as any)?.files[0];

        // check file size
        if (file.size > 2000000) {
          alert('File size is too large');
          setErrorMessage('File size is too large');
          return;
        }
        setUploading(true);
        handleImageUpload(
          file,
          function (imageUrl: string) {
            callback(imageUrl, { alt: file.name });
          },
          function (errorMessage: string) {
            setErrorMessage(errorMessage);
          }
        );
        setUploading(false);
      };
    }
  };

  return (
    <>
      <Box>
        <input id="img-file" type="file" name="img-file" style={{ display: 'none' }} />
        <Editor
          apiKey="3cayhsc52gtz702zsmystt6wlvaiu9t316u2ynyfg7j24lir"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={
            currentState.editedHtml.length === 0 ? `${html}<p></p>` : currentState.editedHtml
          }
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'code',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | blocks fontsize | bold italic underline strikethrough | link image code table mergetags | typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            automatic_uploads: true,
            file_browser_callback_types: 'image',
            image_advtab: true,
            images_upload_url: 'tekitou',
            // @ts-ignore
            images_upload_handler: handleImageUpload,
            file_picker_callback: handleFilePicker,
            content_style: tinyMceContentStyle,
          }}
        />
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={convertShortCode}
              onChange={() => setConvertShortCode(!convertShortCode)}
            />
          }
          label="Convert html to Word Balloon shortcode(require Word Balloon Plugin)"
        />
      </Box>
      <Box sx={{ display: 'flex', justigyContent: 'flex-end' }}>
        <Button onClick={() => handlSteper('back')} sx={{ mt: 3, ml: 1 }}>
          Back
        </Button>
        <Button variant="contained" onClick={() => handlSteper('next')} sx={{ mt: 3, ml: 1 }}>
          Next
        </Button>
      </Box>
      <ImageUploadingDialog />
      <ErrorDialog />
    </>
  );
};

export default PostEditorTinyMce;
