import React from 'react';
import PlayBoardComp from "./PlayBoardComp.tsx";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import ControlsComp from "./ControlsComp.tsx";
import Board from "../modules/Board.ts";
import Repository from "../modules/Repository.ts";
import Wasm from "../modules/Wasm.ts";

const AppComp = () => {

    const location = useLocation();

    const getPlayBoard = () => {
        const pbn = new Repository().readPbn();

        const strain = new Wasm(Module).calcDDTable(pbn).getBestStrain()

        return new Board(pbn, strain);
    };

    // const exercises = Array.from({ length: 10 }).map((_, i) => {
    //     console.log('ex:', i);
    //     return generateExercise(new Wasm(Module));
    // });

    // const exercises: Exercise[] = [];

    return (
        <>
            {/*{ exercises.map((ex, i) =>*/}
            {/*    <PrintBoardComp num={i + 1}*/}
            {/*                    key={i}*/}
            {/*                    exercise={ex} />)  }*/}
            {/*<PlayBoardComp wasm={new Wasm(Module)} />*/}

            <Switch>
                <Route path="/play">
                    <PlayBoardComp key={location.pathname} board={getPlayBoard()} />
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