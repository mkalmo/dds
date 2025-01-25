import React from 'react'
import ReactDOM from 'react-dom'

import AppComp from './comp/AppComp.tsx';
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HashRouter basename='/'>
            <AppComp />
        </HashRouter>
    </React.StrictMode>);
