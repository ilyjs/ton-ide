import {RouterProvider} from 'react-router-dom';
import {createTheme, GlobalStyles, ThemeProvider} from '@mui/material';
import {router} from './router/Router';
import {dark} from './styles/Themes';

function App() {
    const theme = createTheme(dark)
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    body: { backgroundColor:  theme.palette.background.default, color: theme.palette.primary.main },
                    ul: {
                        listStyle: "none"
                    }
                }}
            />
            <RouterProvider router={router}/>
        </ThemeProvider>
    )
}

export default App
