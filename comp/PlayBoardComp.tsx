import React, { Component, useState } from 'react';
import { Player, Strain } from "../modules/constants.ts";
import PlayHandComp from "./PlayHandComp.tsx";
import Card from "../modules/Card.ts";
import Board from "../modules/Board.ts";
import Wasm from "../modules/Wasm.ts";
import { formatStrain } from "./common.ts";

type Props = {
    board: Board
}

type State = {
    nCards: Card[]
    sCards: Card[],
    currentTrickLead: Player,
    playedCards: Card[]
    wrongCardPlayed: boolean
    showLastTrick: boolean
}

export default class PlayBoardComp extends Component<Props, {}> {

    state: State = {
        nCards: [],
        sCards: [],
        currentTrickLead: undefined,
        playedCards: [],
        wrongCardPlayed: false,
        showLastTrick: false
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {
                board.undoTrick();
                this.updateBoard(board);
            }
        };

        window.addEventListener('keyup', this.undoKeyHandler);

        this.updateBoard(board);
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.undoKeyHandler);
    }

    playCard(card: Card): void {
        const board = this.props.board;

        this.state.wrongCardPlayed = getCorrectPlays(board)
            .find(c => c.equals(card)) === undefined;

        board.play(board.player, card);

        if (this.state.wrongCardPlayed) {
            this.updateState();
        } else {
            this.updateBoard(board);
        }

        this.state.showLastTrick = true;
    }

    updateBoard(board: Board): void {
        this.state.wrongCardPlayed = false;

        if (!board.isOpponentsTurn()) {
            this.updateState();
            return;
        }

        const opponent: Player = board.player;
        const opponentCard = getCorrectPlays(board)[0];

        board.play(opponent, opponentCard);

        this.updateState();
    }

    updateState() {
        const board = this.props.board;

        this.state.nCards = board.deal.getPlayerCards(Player.North);
        this.state.sCards = board.deal.getPlayerCards(Player.South);

        this.state.currentTrickLead = board.plays.length
            ? board.plays[0].player : undefined
        this.state.playedCards = board.plays.map(p => p.card);

        if (this.opponentPlayedTricksLastCard() && this.state.showLastTrick) {

            // Show last trick, otherwise can't see opponents last play
            this.state.currentTrickLead =
                board.getLastTrick().getLeadPlayer();
            this.state.playedCards = board.getLastTrick().cards();
        }

        this.setState({});
    }

    opponentPlayedTricksLastCard() {
        const board = this.props.board;

        if (this.state.playedCards.length !== 0
            || board.getLastTrick() === undefined) {
            return false;
        }

        const firstPlayer = board.getLastTrick().getPlays()[0].player;

        return firstPlayer === Player.North || firstPlayer === Player.South;
    }

    render() {

        const board = this.props.board;

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        const currentTrickClickAction = () => {
                    this.state.showLastTrick = false;
                    this.updateBoard(board);
                };

        const errorCssClass = this.state.wrongCardPlayed ? 'error' : '';

        return (
            <>
            <div className='trickCount'>
                {formatStrain(board.strain)} &nbsp;
                {board.getNsTrickCount()} / {board.getEwTrickCount()}
            </div>
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
                        { this.state.playedCards.map(card => formatCard(card)) }
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

function getCorrectPlays(board: Board): Card[] {
    const playsResult = new Wasm(Module).nextPlays(
        board.getTrickStartPbn(), board.strain, board.plays.map(p => p.card));

    return playsResult.getCorrectPlays();
}
