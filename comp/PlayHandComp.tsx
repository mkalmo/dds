import React from 'react';
import Card from "../modules/Card.ts";
import { Suit } from "../modules/constants.ts";

type Props = {
    enabled: boolean;
    cards: Card[],
    cardClickAction: (card: Card) => void
}

const PlayHandComp = (props: Props) => {

    const className = props.enabled ? "" : "inactive";
    const action: (c: Card) => void = props.enabled
        ? props.cardClickAction
        : () => {};

    const suitLinks = (suit: Suit) => {
        const cards = props.cards.filter(card => card.suit === suit);

        return <>
            {cards.map((card, i) => <span className={className}
                                          onClick={() => action(card)}
                                          key={i}>{card.rank} </span>)}
               </>;
    }

    return (
        <div className="hand">
            &#9824; {suitLinks(Suit.Spades)} <br/>
            &#9829; <br/>
            &#9830; <br/>
            &#9827; <br/>
        </div>
    );
}

export default PlayHandComp;