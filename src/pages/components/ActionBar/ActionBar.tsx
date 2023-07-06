import {Main} from "./styles/Main";
import {useTheme} from '@mui/material/styles';
//import SendIcon from '@mui/icons-material/Send';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import Tooltip from '@mui/material/Tooltip';

import {grey} from '@mui/material/colors';

import styled from "@emotion/styled";

const Actions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 4px 0;`

const Button = styled.button`
  position: relative;
  align-items: center;
  color: inherit;
  display: flex;
  flex-shrink: 0;
  font-size: 16px;
  height: 32px;
  justify-content: center;
  max-height: 100%;
  padding: 0;
  transition: all .1s ease;
  -webkit-appearance: button;
  background-color: initial;
  background-image: none;
  outline: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  width: 48px;
  margin-top: 12px;

  .icon-active-bar {
    :hover {
      color: #535bf2;
    }
  }
`


export function ActionBar({build, deploy}: { build: () => void,  deploy: () => void}) {
    const theme = useTheme();
    return (<Main theme={theme}>
        <Actions>
            <Button><FileCopyOutlinedIcon className="icon-active-bar" sx={{color: grey['A400']}}/></Button>
            <Tooltip placement="left-start" title="Build">
            <Button onClick={() => build()}><BuildOutlinedIcon className="icon-active-bar" sx={{color: grey['A400']}}/></Button>
            </Tooltip>
            <Tooltip placement="left-start" title="Deploy">
            <Button onClick={() => deploy()}><ChangeCircleOutlinedIcon className="icon-active-bar" sx={{color: grey['A400']}}/></Button>
            </Tooltip>
        </Actions>

    </Main>);
}