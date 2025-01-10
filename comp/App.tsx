import React from 'react';
import BoardComp from "./BoardComp.tsx";
import { generateExercise } from "../dev/generator.ts";
import Wasm from "./Wasm.ts";

const App = () => {

    const exercises = Array.from({ length: 10 }).map((_, i) => {
        console.log('ex:', i);

        return generateExercise(new Wasm(Module));
    });

    return (
        <>
            { exercises.map((ex, i) =>
                <BoardComp num={i + 1}
                           key={Math.random()}
                           exercise={ex} />)  }
        </>
    );

}

export default App;