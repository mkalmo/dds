import React from 'react';
import Card from "../modules/Card.ts";
import { Suits } from "../modules/constants.ts";

type Props = {
    num: number,
    cards: Card[],
}

const PrintHandComp = (props: Props) => {

    const suits = Suits
        .map(suit => props.cards.filter(card => card.suit === suit)
            .map(c => <span>{c.rank}</span>));

    return (
        <div className="hand">
            <div><span>&#9824;</span>{suits[0]}</div>
            <div><span>&#9829;</span>{suits[1]}</div>
            <div><span>&#9830;</span>{suits[2]}</div>
            <div><span>&#9827;</span>{suits[3]}</div>
        </div>
    );
}

export default PrintHandComp;