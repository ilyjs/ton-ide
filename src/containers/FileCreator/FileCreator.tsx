import React from 'react';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import styled from '@emotion/styled';
import { IconButton } from '@mui/material';

const Wrapper = styled.div`
  display: flex;
  justify-content: end;
  padding: 10px;
`;

interface IProps {
  addFolder: (event: React.MouseEvent) => void;
  addFile: (event: React.MouseEvent) => void;
}

export const FileCreator = ({addFolder, addFile}: IProps) => {
  return <Wrapper> <IconButton onClick={addFolder} aria-label='addFolder'>
    <CreateNewFolderIcon fontSize='small' />
  </IconButton>
    <IconButton onClick={addFile} aria-label='addFile'>
      <NoteAddIcon fontSize='small' />
    </IconButton>
  </Wrapper>;
};