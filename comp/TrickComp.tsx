import React from 'react';
import HandComp from "./HandComp.tsx";
import Exercise from "./Exercise.ts";
import { Players } from "../constants.ts";
import Card from "./Card.ts";
import Trick from "./Trick.ts";

type Props = {
    trick: Trick
    key: number
}

function formatSuit(suit: string): string {
    const index = ['N', 'S', 'H', 'D', 'C'].indexOf(suit);
    return String.fromCharCode([78, 9824, 9829, 9830, 9827][index]);
}

const TrickComp = (props: Props) => {

    const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
        {c.rank}
        <span>{ formatSuit(c.suit) } </span>
    </React.Fragment>;

    return (
        <div>
            <span>{ props.trick.getLeadPlayer() }&nbsp;</span>
            { props.trick.cards().map(c => formatCard(c)) }
        </div>);
}

export default TrickComp;