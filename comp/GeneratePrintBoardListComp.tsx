import React from 'react';
import {createExercise, generateBoard} from "../modules/generator.ts";
import Wasm, {DDSModule} from "../modules/Wasm.ts";
import PrintBoardComp from "./PrintBoardComp.tsx";

declare var Module: DDSModule;

interface Props {
    count: number
}

const GeneratePrintBoardListComp = ({count}: Props) => {

    const wasm = new Wasm(Module);

    const exercises = Array.from({length: count}).map((_, i) => {
        return createExercise(generateBoard(wasm), wasm);
    });

    return (
        <>
            {exercises.map((ex, i) =>
                <PrintBoardComp num={i + 1}
                                key={i}
                                exercise={ex}/>)
            }
        </>);
}

export default GeneratePrintBoardListComp;