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

    const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
        {c.rank}
        <span>{ formatStrain(c.suit as Strain) } </span>
    </React.Fragment>;

    return (
        <div>
            <span>{ props.trick.getLeadPlayer() }&nbsp;</span>
            { props.trick.cards().map(c => formatCard(c)) }
        </div>);
}

export default TrickComp;