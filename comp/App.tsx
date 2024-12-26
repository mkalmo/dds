import React from 'react';
// @ts-ignore
import Board from "./Board.tsx";
// @ts-ignore
import generateHands from "../dev/generator.ts";

const App = () => {

    const hands = generateHands(9, 16);

    const data = [1];

    return (
        <>
            { data.map(e => <Board num={1} key={Math.random()} hands={hands} />)  }
        </>
    );

}

export default App;