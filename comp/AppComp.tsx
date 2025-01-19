import React from 'react';
import PrintBoardComp from "./PrintBoardComp.tsx";
import { generateBoard, generateDeal, generateExercise } from "../modules/generator.ts";
import Wasm from "../modules/Wasm.ts";
import PlayBoardComp from "./PlayBoardComp.tsx";
import Exercise from "../modules/Exercise.ts";

const AppComp = () => {

    // const exercises = Array.from({ length: 2 }).map((_, i) => {
    //     // console.log('ex:', i);
    //     // return generateExercise(new Wasm(Module));
    // });
    const exercises: Exercise[] = [];

    const board = generateBoard(new Wasm(Module));

    return (
        <>
            { exercises.map((ex, i) =>
                <PrintBoardComp num={i + 1}
                                key={i}
                                exercise={ex} />)  }

            <PlayBoardComp board={board} />
        </>
    );

}

export default AppComp;