import React, { Component, useState } from 'react';
import { Player, Strain } from "../modules/constants.ts";
import PlayHandComp from "./PlayHandComp.tsx";
import Card from "../modules/Card.ts";
import { Board } from "../modules/Board.ts";
import Wasm from "../modules/Wasm.ts";
import { formatStrain } from "./common.ts";

type Props = {
    board: Board
}

const wasm = new Wasm(Module);

function makeOpponentMove(board: Board): void {
    const opponent: Player = board.player;
    console.log('opponent', opponent);

    const playsResult = wasm.nextPlays(
        board.lastTrickPBN, board.strain, board.plays.map(p => p.card));

    const opponentCard = playsResult.getCorrectPlays()[0];

    console.log('opponentCard', opponentCard);

    board.play(opponent, opponentCard);

    console.log('player', board.player);
}

type State = {
    nCards: Card[]
    sCards: Card[],
    currentTrickLead: Player,
    currentTrickCards: Card[]
}

export default class PlayBoardComp extends Component<Props, {}> {

    state: State = {
        nCards: [],
        sCards: [],
        currentTrickLead: undefined,
        currentTrickCards: []
    }

    async componentDidMount() {
        const board = this.props.board;

        makeOpponentMove(board);

        this.updateState();
    }

    playCard(card: Card): void {
        const board = this.props.board;

        console.log('player: ', board.player, ' card: ', card);
        board.play(board.player, card);

        if (board.isOpponentsTurn()) {
            makeOpponentMove(board);
        }

        this.updateState();
    }

    updateState() {
        const board = this.props.board;

        this.state.nCards = board.cards.getPlayerCards(Player.North);
        this.state.sCards = board.cards.getPlayerCards(Player.South);

        this.state.currentTrickLead = board.plays.length
            ? board.plays[0].player : undefined
        this.state.currentTrickCards = board.plays.map(p => p.card);

        if (board.isOpponentsTurn()
            && this.state.currentTrickCards.length === 0
            && board.getLastTrick() !== undefined) {

            this.state.currentTrickLead =
                board.getLastTrick().getLeadPlayer();
                this.state.currentTrickCards = board.getLastTrick().cards();
        }

        this.setState({});
    }

    render() {

        const board = this.props.board;

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        const currentTrickClickAction = () => {
            if (board.isOpponentsTurn()) {
                makeOpponentMove(board);
                this.updateState();
            }
        };

        return (
            <>
            <div className='trickCount'>{board.nsTricks} / {board.ewTricks}</div>
            <div className="play-table">
                <div>
                    <PlayHandComp cardClickAction={c => this.playCard(c)}
                                  isValidPlayFunc={c => board.isValidPlay(c)}
                                  cards={this.state.nCards}/>
                </div>
                <div>
                    <div className="hand" onClick={currentTrickClickAction}>
                        <span className='small'>{ this.state.currentTrickLead }</span>
                        &nbsp;
                        { this.state.currentTrickCards.map(card => formatCard(card)) }
                    </div>
                </div>
                <div>
                    <PlayHandComp cardClickAction={c => this.playCard(c)}
                                  isValidPlayFunc={c => board.isValidPlay(c)}
                                  cards={this.state.sCards}/>
                </div>
            </div>
            </>);
    }
}
