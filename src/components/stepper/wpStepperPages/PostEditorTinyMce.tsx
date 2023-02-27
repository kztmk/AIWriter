/* eslint-disable consistent-return */
// import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
// import CircularProgress from '@mui/material/CircularProgress';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Editor } from '@tinymce/tinymce-react';
import { Suspense, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Editor as TinyMCEEditor } from 'tinymce';

import { StepperProps, WpPostStepperInputData } from '../WpPostStepperInputData';

// eslint-disable-next-line max-len
// type UploadHandler = (blobInfo: tinymce.BlobInfo, success: (filename: string) => void, failure: () => void) => void;

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

  const [convertShortCode, setConvertShortCode] = useState(true);
  // const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // const [openErrorDialog, setOpenErrorDialog] = useState(false);

  const { t } = useTranslation();

  // use convert chatLogs to tinyMCE content
  const baloonLeftPrefix = '<!-- baloon-left-prefix --><div class="baloon_left">';
  const baloonLeftSurfix = '</div><!-- baloon-left-surfix -->';
  const baloonRightPrefix =
    '<!-- baloon-right-prefix --><div class="completion"><div class="baloon_right">';
  const baloonRightSurfix = '</div></div><!-- baloon-right-surfix -->';

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
    html = currentState.chatPanel.chatLogs.reduce(
      (chats: string, chat) => `${chats}${baloonLeftPrefix}${chat.prompt}${baloonLeftSurfix}
        ${baloonRightPrefix}${chat.completion}${baloonRightSurfix}`,
      ''
    );
  } else {
    html = currentState.chatPanel.chatLogs.reduce(
      (chats: string, chat) => `${chats}\n<p>${chat.completion}</p>`,
      ''
    );
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

  // const ImageUploadingDialog = () => (
  //   <Box
  //     sx={{
  //       display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000000,
  //     }}
  //   >
  //     <Backdrop
  //       sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
  //       open={uploading}
  //     >
  //       <CircularProgress sx={{ zIndex: 100000000 }} />
  //     </Backdrop>
  //   </Box>
  // );

  // const handleCloseErrorDialog = () => {
  //   setOpenErrorDialog(false);
  // };

  // const ErrorDialog = () => (
  //   <Dialog
  //     open={openErrorDialog}
  //     onClose={handleCloseErrorDialog}
  //     aria-labelledby="alert-dialog-title"
  //     aria-describedby="alert-dialog-description"
  //     sx={{ zIndex: 999999 }}
  //   >
  //     <DialogTitle id="alert-dialog-title">Error!</DialogTitle>
  //     <DialogContent>
  //       <DialogContentText id="alert-dialog-description">{errorMessage}</DialogContentText>
  //     </DialogContent>
  //     <DialogActions>
  //       <Button onClick={handleCloseErrorDialog} autoFocus>
  //         OK
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // );

  const handleImageUpload = async (
    file: any,
    success: (url: string) => void,
    failure: (msg: string) => void
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    // setUploading(true);

    try {
      const response = await fetch(`${targetWp.url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${targetWp.token}`,
        },
        body: formData,
      });

      // setUploading(false);

      const data = await response.json();

      return success(data.source_url);
    } catch (error) {
      // setUploading(false);
      failure('Image upload failed');
    }
  };

  const handleFilePicker = (
    callback: (url: string, meta: { title?: string; alt?: string }) => void,
    value: string,
    meta: {
      filetype: string;
      title?: string | undefined;
      width?: number | undefined;
      height?: number | undefined;
    }
  ) => {
    if (meta.filetype === 'image') {
      const input = document.getElementById('img-file') as HTMLInputElement;
      if (!input) return;
      input.click();
      input.onchange = () => {
        const file = (input as any)?.files[0];

        // check file size
        if (file.size > 2000000) {
          alert('File size is too large');
          // setErrorMessage('File size is too large');
          return;
        }
        // setUploading(true);
        handleImageUpload(
          file,
          (imageUrl: string) => {
            callback(imageUrl, { alt: file.name });
          },
          (errorMsg: string) => {
            setErrorMessage(errorMsg);
          }
        );
        // setUploading(false);
      };
    }
  };

  // const [language, setLanguage] = useState('ja');
  // const [contents, setContents] = useState('');

  // const handleEditorChange = (content: string, editor: any) => {
  //   setContents(content);
  // };
  // const handleLanguageButtonClick = (e: any) => {
  //   console.log(`language: ${language}`);
  //   console.log(`to-${e.value.code}`);
  //   if (e.value.code === 'ja') {
  //     setLanguage('ja');
  //   } else if (e.value.code === 'en') {
  //     setLanguage('en');
  //   }
  // };

  // editor.on('ExecCommand', (e) => {
  //   if (e.command === 'Lang') {
  //     console.log(`from-${language}`);
  //     console.log('Lang', e.value.code);
  //     handleLanguageButtonClick(e);
  //   }
  // });

  // onEditorChange={handleEditorChange}
  return (
    <Suspense>
      <Box>
        <input id="img-file" type="file" name="img-file" style={{ display: 'none' }} />
        <Editor
          apiKey="3cayhsc52gtz702zsmystt6wlvaiu9t316u2ynyfg7j24lir"
          // eslint-disable-next-line no-return-assign
          onInit={(evt, editor) => {
            editorRef.current = editor;
          }}
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
              'language | undo redo | blocks fontsize | bold italic underline strikethrough | link image code table mergetags | typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            content_langs: [
              { title: 'English', code: 'en' },
              { title: 'Japanese', code: 'ja' },
            ],
            language: 'ja',
            automatic_uploads: true,
            file_browser_callback_types: 'image',
            image_advtab: true,
            images_upload_url: 'tekitou',
            images_upload_handler: handleImageUpload as any,
            file_picker_callback: handleFilePicker as any,
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
          label={t('postEditor.convertToBalloon')}
        />
      </Box>
      <Box sx={{ display: 'flex', justigyContent: 'flex-end' }}>
        <Button onClick={() => handlSteper('back')} sx={{ mt: 3, ml: 1 }}>
          {t('stepperWp.buttonBack')}
        </Button>
        <Button variant="contained" onClick={() => handlSteper('next')} sx={{ mt: 3, ml: 1 }}>
          {t('stepperWp.buttonNext')}
        </Button>
      </Box>
    </Suspense>
  );
};

export default PostEditorTinyMce;
