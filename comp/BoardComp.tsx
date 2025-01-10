import React from 'react';
import HandComp from "./HandComp.tsx";
import Exercise from "./Exercise.ts";
import { Players } from "../constants.ts";
import Card from "./Card.ts";

type Props = {
    exercise: Exercise,
    num: number,
    key: number
}

function formatCard(card: Card): string {
    return card.rank + formatSuit(card.suit);
}

function formatSuit(suit: string): string {
    const index = ['N', 'S', 'H', 'D', 'C'].indexOf(suit);
    return String.fromCharCode([78, 9824, 9829, 9830, 9827][index]);
}

const BoardComp = (props: Props) => {

    const [nCards, eCards, sCards, wCards] =
        Players.map(player => props.exercise.deal.getPlayerCards(player));

    return (
        <div className="frames">
            <div className="grid-table">
                <div></div>
                <div className='northCell'>
                    <span className='info'>
                        {formatSuit(props.exercise.strain)}&nbsp;
                        {formatCard(props.exercise.getLead())}&nbsp;
                        ({props.exercise.target})
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
                    (trick, i) => <div key={i}>{ trick.toString() }</div>)  }
            </div>
        </div>);

}

export default BoardComp;