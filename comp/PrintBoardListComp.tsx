import React from 'react';
import { useParams } from "react-router-dom";
import {createExercise, createBoard, generateBoard} from "../modules/generator.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import PrintBoardComp from "./PrintBoardComp.tsx";

declare var Module: DDSModule;

const PrintBoardListComp = () => {

    const params: any = useParams();

    const wasm = new Wasm(Module);

    const exercises = Array.from({ length: params.count }).map((_, i) => {
            console.log('ex:', i);
            return createExercise(generateBoard(wasm), wasm);
        });

    return (
        <>
            { exercises.map((ex, i) =>
                <PrintBoardComp num={i + 1}
                                key={i}
                                exercise={ex} />)
            }
        </>);
}

export default PrintBoardListComp;