import React from 'react';
import Card from "../modules/Card.ts";
import { Suit } from "../modules/constants.ts";

type Props = {
    cards: Card[],
    isValidPlayFunc: (card: Card) => boolean,
    cardClickAction: (card: Card) => void
}

const PlayHandComp = (props: Props) => {

    const className = (c: Card) => props.isValidPlayFunc(c) ? 'active' : '';
    const action = (c: Card) => props.isValidPlayFunc(c) && props.cardClickAction(c);

    const suitLinks = (suit: Suit) => {
        const cards = props.cards.filter(card => card.suit === suit);

        return <>
            {cards.map((card, i) => <span className={className(card)}
                                          onClick={() =>action(card)}
                                          key={i}>{card.rank} </span>)}
               </>;
    }

    return (
        <div className="hand">
            &#9824; {suitLinks(Suit.Spades)} <br/>
            &#9829; {suitLinks(Suit.Harts)}<br/>
            &#9830; {suitLinks(Suit.Diamonds)}<br/>
            &#9827; {suitLinks(Suit.Clubs)}<br/>
        </div>
    );
}

export default PlayHandComp;