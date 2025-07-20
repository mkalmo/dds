import React from 'react'

import AppComp from './comp/AppComp.tsx';
import { HashRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <HashRouter basename='/'>
            <AppComp />
        </HashRouter>
    </React.StrictMode>);
