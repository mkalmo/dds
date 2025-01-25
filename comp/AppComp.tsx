import React from 'react';
import PlayBoardComp from "./PlayBoardComp.tsx";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import ControlsComp from "./ControlsComp.tsx";
import Board from "../modules/Board.ts";
import Repository from "../modules/Repository.ts";
import Wasm from "../modules/Wasm.ts";
import PrintBoardListComp from "./PrintBoardListComp.tsx";

const AppComp = () => {

    const location = useLocation();

    const getPlayBoard = () => {
        const pbn = new Repository().readPbn();

        const strain = new Wasm(Module).calcDDTable(pbn).getBestStrain()

        return new Board(pbn, strain);
    };

    return (
        <>
            <Switch>
                <Route path="/play">
                    <PlayBoardComp key={location.pathname} board={getPlayBoard()} />
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