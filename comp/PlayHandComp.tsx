import React from 'react';
import Card from "../modules/Card.ts";
import { Suit } from "../modules/constants.ts";

type Props = {
    cards: Card[],
    isValidPlayFunc: (card: Card) => boolean,
    isBadPlayFunc: (card: Card) => boolean,
    cardClickAction: (card: Card) => void
}

function getCardCssClass(props: Props): (c: Card) => string {
    return (c: Card) => {
        if (props.isBadPlayFunc(c)) {
            return 'bad-card';
        } else if (props.isValidPlayFunc(c)) {
            return 'active-card';
        } else {
            return '';
        }
    }

}

const PlayHandComp = (props: Props) => {

    const cardCssClassFunc = getCardCssClass(props);

    const action = (c: Card) => props.isValidPlayFunc(c) && props.cardClickAction(c);

    const suitLinks = (suit: Suit) => {
        const cards = props.cards.filter(card => card.suit === suit);

        return <>
            {cards.map((card, i) => <span className={cardCssClassFunc(card)}
                                          onClick={() =>action(card)}
                                          key={i}>{card.rank} </span>)}
               </>;
    }

    return (
        <div>
            &#9824; {suitLinks(Suit.Spades)} <br/>
            <span className='red-suit'>&#9829;</span> {suitLinks(Suit.Harts)}<br/>
            <span className='red-suit'>&#9830;</span> {suitLinks(Suit.Diamonds)}<br/>
            &#9827; {suitLinks(Suit.Clubs)}<br/>
        </div>
    );
}

export default PlayHandComp;