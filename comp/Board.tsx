import React from 'react';
// @ts-ignore
import HandComp from "./HandComp.tsx";
// @ts-ignore
import Hand from "./Hand.ts";

type Props = {
    hands: Hand[],
    num: number,
    key: number
}

const Board = (props: Props) => {

    const nHand = props.hands[0];
    const eHand = props.hands[1];
    const sHand = props.hands[2];
    const wHand = props.hands[3];

    return (
        <div className="grid-table">
            <div></div>
            <div><HandComp num={1} hand={nHand}/></div>
            <div>3</div>
            <div><HandComp num={1} hand={eHand}/></div>
            <div>{props.num}</div>
            <div><HandComp num={1} hand={wHand}/></div>
            <div>7</div>
            <div><HandComp num={1} hand={sHand}/></div>
            <div>9</div>
        </div>
    );

}
// <div>this board {props.num}</div>;

export default Board;