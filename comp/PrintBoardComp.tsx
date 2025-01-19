import React from 'react';
import HandComp from "./HandComp.tsx";
import Exercise from "../modules/Exercise.ts";
import { Players, Strain, Strains } from "../modules/constants.ts";
import Card from "../modules/Card.ts";
import TrickComp from "./TrickComp.tsx";

type Props = {
    exercise: Exercise,
    num: number,
    key: number
}

function formatCard(card: Card): string {
    return card.rank + formatStrain(card.suit as Strain);
}

function formatStrain(suit: Strain): string {
    const index = Strains.indexOf(suit);
    return String.fromCharCode([78, 9824, 9829, 9830, 9827][index]);
}

const PrintBoardComp = (props: Props) => {

    const [nCards, eCards, sCards, wCards] =
        Players.map(player => props.exercise.deal.getPlayerCards(player));

    return (
        <div className="frames">
            <div className="grid-table">
                <div></div>
                <div className='northCell'>
                    <span className='info'>
                        {formatStrain(props.exercise.strain)}&nbsp;
                        {formatCard(props.exercise.getLead())}
                    </span>
                    <HandComp num={1} cards={nCards}/>
                </div>
                <div></div>
                <div><HandComp num={1} cards={wCards}/></div>
                <div>{props.num}</div>
                <div><HandComp num={1} cards={eCards}/></div>
                <div></div>
                <div><HandComp num={1} cards={sCards}/></div>
                <div></div>
            </div>
            <div className='tricks'>
                { props.exercise.tricks.map(
                    (trick, i) => <TrickComp key={i} trick={ trick } />)  }
            </div>
            <footer className='footer'>
                {props.exercise.target} { props.exercise.deal.getPbn() }
            </footer>
        </div>);
}

export default PrintBoardComp;