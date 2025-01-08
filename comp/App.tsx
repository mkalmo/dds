import React from 'react';
import BoardComp from "./BoardComp.tsx";
import generateHands from "../dev/generator.ts";

const App = () => {

    const deal = generateHands(9, 16);

    const data = [1];

    return (
        <>
            { data.map(e => <BoardComp num={1} key={Math.random()} deal={deal} />)  }
        </>
    );

}

export default App;