import React from 'react';
import PlayBoardComp from "./PlayBoardComp.tsx";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import ControlsComp from "./ControlsComp.tsx";
import Board from "../modules/Board.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import GeneratePrintBoardListComp from "./GeneratePrintBoardListComp.tsx";
import BoardListComp from "./BoardListComp.tsx";
import ShowPrintBoardListComp from "./ShowPrintBoardListComp.tsx";

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
                <Route path="/generate-print/:count" render={ (props: any) =>
                    <GeneratePrintBoardListComp count={props.match.params.count} /> }>
                </Route>
                <Route path="/show-print">
                    <ShowPrintBoardListComp />
                </Route>
                <Route path="/boards">
                    <BoardListComp />
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