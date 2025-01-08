import React from 'react';
import HandComp from "./HandComp.tsx";
import Deal from "./Deal.ts";

type Props = {
    deal: Deal,
    num: number,
    key: number
}

const BoardComp = (props: Props) => {

    return (
        <div className="grid-table">
            <div></div>
            <div><HandComp num={1} hand={props.deal.nHand}/></div>
            <div>3</div>
            <div><HandComp num={1} hand={props.deal.eHand}/></div>
            <div>{props.num}</div>
            <div><HandComp num={1} hand={props.deal.wHand}/></div>
            <div>7</div>
            <div><HandComp num={1} hand={props.deal.sHand}/></div>
            <div>9</div>
        </div>
    );

}
// <div>this board {props.num}</div>;

export default BoardComp;