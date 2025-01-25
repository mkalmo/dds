import React from 'react';
import PrintHandComp from "./PrintHandComp.tsx";
import Exercise from "../modules/Exercise.ts";
import { Player, Players, Strain } from "../modules/constants.ts";
import { formatStrain } from "./common.ts";
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
                    <PrintHandComp num={1} cards={nCards}/>
                </div>
                <div></div>
                <div><PrintHandComp num={1} cards={wCards}/></div>
                <div>{props.num}</div>
                <div><PrintHandComp num={1} cards={eCards}/></div>
                <div></div>
                <div><PrintHandComp num={1} cards={sCards}/></div>
                <div></div>
            </div>
            <div className='tricks'>
                { props.exercise.tricks.map(
                    (trick, i) => <TrickComp key={i} trick={ trick } />)  }
            </div>
            <footer className='footer'>
                352{props.exercise.target}8655 { props.exercise.deal.getPbn(Player.West) }
            </footer>
        </div>);
}

export default PrintBoardComp;