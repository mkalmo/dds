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

function formatCard(card: Card): string {
    return card.rank + formatSuit(card.suit);
}

function formatSuit(suit: string): string {
    const index = ['N', 'S', 'H', 'D', 'C'].indexOf(suit);
    return String.fromCharCode([78, 9824, 9829, 9830, 9827][index]);
}

const TrickComp = (props: Props) => {

    return (
        <>
            <div>{ props.trick.getLeadPlayer() }</div>
            { props.trick.cards().map(c => formatCard(c) + ' ') }
        </>);
}

export default TrickComp;