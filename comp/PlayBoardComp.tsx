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

function getCorrectPlays(board: Board): Card[] {
    console.log(board.getTrickStartPbn());
    console.log(board.plays.map(p => p.card.toString()).join(', '));

    const playsResult = wasm.nextPlays(
        board.getTrickStartPbn(), board.strain, board.plays.map(p => p.card));

    return playsResult.getCorrectPlays();
}

function makeOpponentMove(board: Board): void {
    const opponent: Player = board.player;
    console.log('opponent', opponent);

    const opponentCard = getCorrectPlays(board)[0];

    console.log('opponentCard', opponentCard);

    board.play(opponent, opponentCard);

    console.log('player', board.player);
}

type State = {
    nCards: Card[]
    sCards: Card[],
    currentTrickLead: Player,
    currentTrickCards: Card[]
    wrongCardPlayed: boolean
}

export default class PlayBoardComp extends Component<Props, {}> {

    state: State = {
        nCards: [],
        sCards: [],
        currentTrickLead: undefined,
        currentTrickCards: [],
        wrongCardPlayed: false
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {
                console.log('undo trick');
                board.undoTrick();
                if (board.isOpponentsTurn()) {
                    makeOpponentMove(board);
                }
                this.updateState();
            }
        }

        window.addEventListener('keyup', this.undoKeyHandler);

        makeOpponentMove(board);

        this.updateState();
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.undoKeyHandler);
    }

    playCard(card: Card): void {
        const board = this.props.board;

        console.log('player: ', board.player, ' card: ', card);

        this.state.wrongCardPlayed = getCorrectPlays(board)
            .find(c => c.toString() === card.toString()) === undefined;

        board.play(board.player, card);

        if (board.isOpponentsTurn()) {
            makeOpponentMove(board);
        }

        this.updateState();
    }

    updateState() {
        const board = this.props.board;

        this.state.nCards = board.deal.getPlayerCards(Player.North);
        this.state.sCards = board.deal.getPlayerCards(Player.South);

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

        const errorCssClass = this.state.wrongCardPlayed ? 'error' : '';

        return (
            <>
            <div className='trickCount'>{board.getNsTrickCount()} / {board.getEwTrickCount()}</div>
            <div className="play-table">
                <div>
                    <PlayHandComp cardClickAction={c => this.playCard(c)}
                                  isValidPlayFunc={c => board.isValidPlay(c)}
                                  cards={this.state.nCards}/>
                </div>
                <div>
                    <div className={'hand ' + errorCssClass} onClick={currentTrickClickAction}>
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
