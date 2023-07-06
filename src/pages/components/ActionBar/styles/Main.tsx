import styled from "@emotion/styled";

import {Theme} from '@mui/material/styles';

interface StyledDivProps {
    theme: Theme;
}

export const Main = styled('div')<StyledDivProps>(({theme}) => ({
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))',
    flexDirection: 'column',
    flexShrink: 0,
    justifyContent: 'space-between',
    zIndex: 10
}));