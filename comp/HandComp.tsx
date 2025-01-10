import React from 'react';
import Card from "./Card.ts";
import { Suits } from "../constants.ts";

type Props = {
    num: number,
    cards: Card[],
}

const HandComp = (props: Props) => {

    const suits = Suits
        .map(suit => props.cards.filter(card => card.suit === suit)
            .map(c => c.rank).join(' '));

    return (
        <div className="hand">
            &#9824; {suits[0]}<br/>
            &#9829; {suits[1]}<br/>
            &#9830; {suits[2]}<br/>
            &#9827; {suits[3]}<br/>
        </div>
    );
}

export default HandComp;