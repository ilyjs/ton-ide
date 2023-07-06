import {memo} from "react";
import {Main} from "./styles/Main.tsx";
//import {WebContainer} from "@webcontainer/api";

import 'react-mosaic-component/react-mosaic-component.css';
import './styles/mosaic-custom-theme.css'
// import '@blueprintjs/core/lib/css/blueprint.css';
// import '@blueprintjs/icons/lib/css/blueprint-icons.css';

export const Home = memo(() => {

    return (
        <Main>

              <h1>Hello</h1>
        </Main>
    );
})