import React, { Component, useState } from 'react';
import { Player, Strain } from "../modules/constants.ts";
import PlayHandComp from "./PlayHandComp.tsx";
import Card from "../modules/Card.ts";
import Board from "../modules/Board.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import { formatStrain } from "../modules/common.ts";

declare var Module: DDSModule;

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

export default class PlayBoardComp extends Component<Props, State> {

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
                this.setState({wrongCardPlayed: false},
                    () => this.refreshBoard());

                board.undoTrick();

                this.makeOpponentMoveIfNeeded();

                this.refreshBoard();
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

        const wrongCardPlayed = getCorrectPlays(board)
            .find(c => c.equals(card)) === undefined;

        board.play(board.player, card);

        if (wrongCardPlayed) {
            this.setState({wrongCardPlayed}, () => this.refreshBoard());

        } else {
            this.makeOpponentMoveIfNeeded();

            this.refreshBoard();
        }
    }

    makeOpponentMoveIfNeeded(): void {
        const board = this.props.board;

        if (!board.isOpponentsTurn()) {
            return;
        }

        const opponent: Player = board.player;
        const opponentCard = getCorrectPlays(board)[0];

        board.play(opponent, opponentCard);
    }

    updateBoard(board: Board): void {
        this.setState({ wrongCardPlayed: false });

        if (!board.isOpponentsTurn()) {
            this.refreshBoard();
            return;
        }

        const opponent: Player = board.player;
        const opponentCard = getCorrectPlays(board)[0];

        board.play(opponent, opponentCard);

        this.refreshBoard();
    }

    refreshBoard() {
        const board = this.props.board;

        const nCards = board.deal.getPlayerCards(Player.North);
        const sCards = board.deal.getPlayerCards(Player.South);

        let currentTrickLead = board.plays.length
            ? board.plays[0].player : undefined
        let playedCards = board.plays.map(p => p.card);

        if (board.plays.length === 0 && board.getLastTrick() !== undefined) {
            // Show last trick, otherwise can't see opponents last play
            currentTrickLead =
                board.getLastTrick().getLeadPlayer();
            playedCards = board.getLastTrick().cards();
        }

        this.setState({ nCards, sCards, currentTrickLead, playedCards });
    }

    iPlayedTricksLastCard() {
        const board = this.props.board;

        if (board.getLastTrick() === undefined) {
            return false;
        }

        const lastPlayer = board.getLastTrick().getPlays()[3].player;

        return lastPlayer === Player.North || lastPlayer === Player.South;
    }

    render() {

        const board = this.props.board;

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        const currentTrickClickAction = () =>
                this.setState( { showLastTrick: false }, () => this.updateBoard(board));

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
