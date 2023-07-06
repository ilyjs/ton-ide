import styled from '@emotion/styled';
import { TextField } from '@mui/material';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';

const StyledTextField = styled(TextField)`
  && {
    input {
      font-size: 14px;
      padding: 6px 6px;

    }
  }
`;

interface IProps {
  text: string;
  onSubmit: (labelText: string) => void;
}

function useOutsideClick(
  ref: React.RefObject<HTMLInputElement>,
  fn: (text: string) => void,
  event: keyof DocumentEventMap = 'mousedown',
) {
  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        fn(ref.current.value);
      }
    }

    document.addEventListener(event, handleClickOutside);
    return () => {
      document.removeEventListener(event, handleClickOutside);
    };
  }, [ref, event, fn]);
}

export const EditableFilenameInput = (props: IProps) => {
  const inputRef = useRef(null);
  const [labelText, setLabelText] = useState(props.text);

  const handleChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      props.onSubmit(labelText);
    }
  };

  useOutsideClick(inputRef, props.onSubmit);

  return <StyledTextField
    autoFocus
    inputRef={inputRef}
    value={labelText}
    onChange={handleChangeText}
    onKeyDown={handleKeyDown}
    onClick={(event) => event.stopPropagation()}
  />;

};