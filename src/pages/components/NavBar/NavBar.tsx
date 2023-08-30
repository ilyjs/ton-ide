import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ReactComponent as MyIcon } from '../../../assets/ton symbol.svg';
import styled  from "@emotion/styled";
import Button from "@mui/material/Button";
import {ButtonGroup} from "@mui/material";

const ActionToolbar = styled(Toolbar)`
  @media (min-width: 600px) {
    padding-left: 12px;
    padding-right: 12px;
  }
  padding-left: 12px;
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  padding-right: 24px;`

const Label = styled(Typography)`
  background: linear-gradient(45deg, #00a0f0 30%, #a100ef);
  background-clip: text;
  -webkit-text-fill-color: transparent;
`

const ActionZone = styled.div`
  display: flex;
  padding-left: 12px;
`

const StyledButton = styled(Button)`
&&{
  padding: 1px 9px;
}
`

export function NavBar({build, deploy, runTest}: { build: () => void,  deploy: () => void, runTest: () => void}) {
    return (
        <Box sx={{ height: 40}}>
            <AppBar position="static">
                <ActionToolbar variant="dense">
                   <Logo> <MyIcon width="24" height="24"/> </Logo>

                    <Label variant="h6" color="inherit">
                        Ton IDE
                    </Label>
                    <ActionZone>
                    <ButtonGroup size="small" variant="outlined" aria-label="outlined button group">
                        <StyledButton onClick={() => build()} size="small" >Build</StyledButton>
                        <StyledButton onClick={() => deploy()} size="small" >Deploy</StyledButton>
                        <StyledButton onClick={() => runTest()} size="small" >Run tests</StyledButton>
                    </ButtonGroup>
                    </ActionZone>
                </ActionToolbar>
            </AppBar>
        </Box>
    )
}