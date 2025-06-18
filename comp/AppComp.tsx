import React from 'react';
import PlayBoardComp from "./PlayBoardComp.tsx";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import ControlsComp from "./ControlsComp.tsx";
import Board from "../modules/Board.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import PrintBoardListComp from "./PrintBoardListComp.tsx";

declare var Module: DDSModule;

function useQuery() {
    const location = useLocation();
    return React.useMemo(() => new URLSearchParams(location.search), [location.search]);
}

const AppComp = () => {

    const query = useQuery();

    const getPlayBoard = () => {
        const pbn = query.get('pbn') || 'W:2... 3... 4... 5...';

        const strain = new Wasm(Module).calcDDTable(pbn).getBestStrain()

        return new Board(pbn, strain);
    };

    return (
        <>
            <Switch>
                <Route path="/play">
                    <PlayBoardComp key={query.get('pbn') || 'default'} board={getPlayBoard()} />
                </Route>
                <Route path="/print/:count">
                    <PrintBoardListComp />
                </Route>
                <Route path="/">
                    <ControlsComp />
                </Route>
                <Route>
                    <Redirect to='/' />
                </Route>
            </Switch>

        </>
    );

}

export default AppComp;