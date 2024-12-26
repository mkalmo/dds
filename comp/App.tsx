import React from 'react';
// @ts-ignore
import Board from "./Board.tsx";

const App = () => {

    const data = [1, 2, 3];

    return (
        <>
            { data.map(e => <Board key={e} num={e} />)  }
        </>
    );

}

export default App;