import React from 'react';
import BoardComp from "./BoardComp.tsx";
import generateDeal from "../dev/generator.ts";

const App = () => {

    // get deal
    // calculate first play
    // calculate trick count
    // calculate trick list

    const deal = generateDeal(9, 16);

    const data = [1];

    return (
        <>
            { data.map(e => <BoardComp num={1} key={Math.random()} deal={deal} />)  }
        </>
    );

}

export default App;