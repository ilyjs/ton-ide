import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import {store, StoreContext} from './store';
//import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <StoreContext.Provider value={{store}}>
            <CssBaseline/>
            <App/>
        </StoreContext.Provider>
    </React.StrictMode>,
)
