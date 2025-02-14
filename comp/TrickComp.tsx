import React from 'react';
import Card from "../modules/Card.ts";
import Trick from "../modules/Trick.ts";
import { formatStrain } from "./common.ts";
import { Strain } from "../modules/constants.ts";

type Props = {
    trick: Trick
    key: number
}

const TrickComp = (props: Props) => {

    const formatCard = (c: Card) => {
        const cssClassTrump = c.suit === props.trick.strain ? 'trump' : '';
        const cssClassWinner = c.equals(props.trick.winnerCard()) ? 'winner' : '';

        return <div className='card' key={c.toString()}>
            <div className={ cssClassWinner }></div>
            <span>{c.rank}</span>
            <span className='suit'>{ formatStrain(c.suit as Strain) } </span>
            <div className={ cssClassTrump }></div>
        </div>;
    }

    return (
        <div>
            <span className='lead'>{ props.trick.getLeadPlayer() }&nbsp;</span>
            { props.trick.cards().map(c => formatCard(c)) }
        </div>);
}

export default TrickComp;