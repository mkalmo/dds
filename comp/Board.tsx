import React from 'react';
// @ts-ignore
import Hand from "./Hand.tsx";

type Props = {
    num: number,
    key: number
}

const Board = (props: Props) => {

    return (
        <div className="grid-table">
            <div></div>
            <div><Hand num={1}/></div>
            <div>3</div>
            <div><Hand num={1}/></div>
            <div>{props.num}</div>
            <div><Hand num={1}/></div>
            <div>7</div>
            <div><Hand num={1}/></div>
            <div>9</div>
        </div>
    );

}
// <div>this board {props.num}</div>;

export default Board;