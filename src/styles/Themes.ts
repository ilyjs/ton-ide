import {ThemeOptions} from '@mui/material';

const BaseTheme = {components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          margin: 0,
          padding: 0
        },
        "html, body, #root": {
          height: "100%"
        },
        ul: {
          listStyle: "none"
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { verticalAlign: "middle" }
      }
    }
  }}

export const light: ThemeOptions = {
  ...BaseTheme,
  palette: {
    mode: "light",
  }
};

export const dark: ThemeOptions = {
  ...BaseTheme,
  palette: {
    mode: 'dark',
  }
}