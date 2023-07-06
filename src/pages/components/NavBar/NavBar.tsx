import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
//import IconButton from '@mui/material/IconButton';
//import MenuIcon from '@mui/icons-material/Menu';
import { ReactComponent as MyIcon } from '../../../assets/ton symbol.svg';
import styled  from "@emotion/styled";

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

export function NavBar() {
    return (
        <Box sx={{ height: 40}}>
            <AppBar position="static">
                <ActionToolbar variant="dense">
                   <Logo> <MyIcon width="24" height="24"/> </Logo>

                    <Label variant="h6" color="inherit">
                        Ton IDE
                    </Label>
                </ActionToolbar>
            </AppBar>
        </Box>
    )
}