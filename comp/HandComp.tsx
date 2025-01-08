import React from 'react';
import Hand from "./Hand.ts";

type Props = {
    num: number,
    hand: Hand,
}

const HandComp = (props: Props) => {

    const suits = ['S', 'H', 'D', 'C']
        .map(suit => props.hand.getCardsOfSuit(suit).join(' '));

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