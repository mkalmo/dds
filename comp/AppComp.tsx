import React from 'react';
import PrintBoardComp from "./PrintBoardComp.tsx";
import { generateExercise } from "../modules/generator.ts";
import Wasm from "../modules/Wasm.ts";

const AppComp = () => {

    const exercises = Array.from({ length: 2 }).map((_, i) => {
        console.log('ex:', i);

        return generateExercise(new Wasm(Module));
    });

    return (
        <>
            { exercises.map((ex, i) =>
                <PrintBoardComp num={i + 1}
                                key={Math.random()}
                                exercise={ex} />)  }
        </>
    );

}

export default AppComp;