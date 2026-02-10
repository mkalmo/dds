import React, {Component} from 'react';
import {Player, Strain} from "../modules/constants.ts";
import PlayHandComp from "./PlayHandComp.tsx";
import Card from "../modules/Card.ts";
import Board from "../modules/Board.ts";
import Wasm, {DDSModule} from "../modules/Wasm.ts";
import {formatStrain} from "../modules/common.ts";
import {Play} from "../modules/types.ts";
import {Link} from "react-router-dom";

declare var Module: DDSModule;

type Props = {
    board: Board,
    mode: 'declarer' | 'defense',
    defensePlayer?: Player
}

type State = {
    nCards: Card[]
    sCards: Card[],
    eCards: Card[],
    wCards: Card[],
    plays: Play[]
    showLastTrick: boolean
    wrongCard: Card | undefined;
    manualMode: boolean;
    showDummy: boolean;
}

export default class PlayBoardComp extends Component<Props, State> {

    state: State = {
        nCards: [],
        sCards: [],
        eCards: [],
        wCards: [],
        plays: [],
        showLastTrick: false,
        wrongCard: undefined,
        manualMode: false,
        showDummy: false
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {

                if (this.props.mode === 'defense') {
                    if (this.state.manualMode) {
                        board.undoPlay();
                    } else {
                        board.undo([this.props.defensePlayer]);
                    }
                } else if (this.state.manualMode) {
                    board.undoPlay();
                } else {
                    board.undo([Player.North, Player.South]);
                }

                this.setState({ wrongCard: undefined });

                this.makeOpponentMoveIfNeeded(); // first play only

                this.redrawBoard();
            }
        };

        window.addEventListener('keyup', this.undoKeyHandler);

        this.makeOpponentMoveIfNeeded();

        this.redrawBoard();
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.undoKeyHandler);
    }

    playCard(card: Card): void {
        const board = this.props.board;

        if (getCorrectPlays(board).find(each => each.equals(card)) === undefined
            && !card.equals(this.state.wrongCard)) { // accept on second click

            this.setState({wrongCard: card});

            return;
        }

        this.setState({wrongCard: undefined});

        board.play(board.player, card);

        this.makeOpponentMoveIfNeeded();

        this.redrawBoard();
    }

    makeOpponentMoveIfNeeded(): void {
        const board = this.props.board;

        if (this.state.manualMode) {
            return;
        }

        if (this.props.mode === 'defense') {
            let maxMoves = 4 - board.plays.length;
            while (board.player !== this.props.defensePlayer && maxMoves > 0) {
                board.play(board.player, getCorrectPlays(board)[0]);
                maxMoves--;
            }
        } else {
            if (!board.isOpponentsTurn()) {
                return;
            }

            const opponentCard = getCorrectPlays(board)
                .sort((a, b) => a.scalarRank - b.scalarRank)[0];

            board.play(board.player, opponentCard);
        }
    }

    redrawBoard() {
        const board = this.props.board;

        const nCards = board.deal.getPlayerCards(Player.North);
        const sCards = board.deal.getPlayerCards(Player.South);
        const eCards = board.deal.getPlayerCards(Player.East);
        const wCards = board.deal.getPlayerCards(Player.West);

        let plays = board.plays;

        if (board.plays.length === 0 && board.getLastTrick() !== undefined) {
            // Show last trick, otherwise can't see opponents last play
            plays = board.getLastTrick().getPlays();
        }

        const showDummy = board.tricks.length > 0 || board.plays.length > 0;

        this.setState({ nCards, sCards, eCards, wCards, plays, showDummy });
    }

    toggleManualMode = () => {
        this.setState({ manualMode: !this.state.manualMode, wrongCard: undefined }, () => {
            if (!this.state.manualMode) {
                this.makeOpponentMoveIfNeeded();
                this.redrawBoard();
            }
        });
    }

    render() {

        const board = this.props.board;
        const isDefense = this.props.mode === 'defense';

        const formatCard = (c: Card) => <div key={c.toString()}>
            {c.rank}
            <span className='suit'>{ formatStrain(c.suit as Strain) } </span>
        </div>;

        const onTrickClickFunc = () => {
            this.makeOpponentMoveIfNeeded();
            this.redrawBoard();
        };

        const getPlay = (player: Player) => {
            return this.state.plays
                .filter((play) => play.player === player)
                .map(p => formatCard(p.card))[0];
        }

        const trickDiv = (
            <div className="trick" onClick={ onTrickClickFunc }>
                <div className="north">{ getPlay(Player.North) }</div>
                <div className="west" >{ getPlay(Player.West) }</div>
                <div className="east" >{ getPlay(Player.East) }</div>
                <div className="south">{ getPlay(Player.South) }</div>
            </div>
        );

        const isValidPlayForPlayer = (c: Card, player: Player) =>
            board.player === player && board.isValidPlay(c);

        const isBadPlayForPlayer = (c: Card, player: Player) =>
            board.player === player && c.equals(this.state.wrongCard);

        const manualMode = this.state.manualMode;

        const renderHand = (player: Player, cards: Card[], visible: boolean, clickable: boolean) => {
            if (!visible) return null;
            return (
                <PlayHandComp
                    cardClickAction={clickable ? (c) => this.playCard(c) : () => {}}
                    isValidPlayFunc={clickable ? (c) => isValidPlayForPlayer(c, player) : () => false}
                    isBadPlayFunc={clickable ? (c) => isBadPlayForPlayer(c, player) : () => false}
                    cards={cards}/>
            );
        };

        const defensePlayer = this.props.defensePlayer;

        // North: defense shows readonly after first play; clickable in manual mode
        const northVisible = !isDefense || this.state.showDummy;
        const northClickable = !isDefense || manualMode;

        // West: defense(W) always clickable; defense(E) hidden; declarer only in manual mode
        const westVisible = (isDefense && defensePlayer === Player.West) || manualMode;
        const westClickable = westVisible;

        // East: defense(E) always clickable; defense(W) hidden; declarer only in manual mode
        const eastVisible = (isDefense && defensePlayer === Player.East) || manualMode;
        const eastClickable = eastVisible;

        // South: declarer always clickable; defense only in manual mode
        const southVisible = !isDefense || manualMode;
        const southClickable = southVisible;

        const header = isDefense ? (
            <div className='play-table-header'>
                <div>
                    <Link to={'/'}>Back</Link>&nbsp;
                    <span onClick={this.toggleManualMode} style={{cursor: 'pointer'}}>
                        {manualMode ? 'Normal' : 'Manual'}
                    </span>
                </div>
                <div>
                    Defense - {formatStrain(board.strain)} &nbsp;
                    {board.getEwTrickCount()} / {board.getNsTrickCount()}
                </div>
            </div>
        ) : (
            <div className='play-table-header'>
                <div>
                    <Link to={'/'}>Back</Link>&nbsp;
                    <span onClick={this.toggleManualMode} style={{cursor: 'pointer'}}>
                        {manualMode ? 'Normal' : 'Manual'}
                    </span>
                </div>
                <div>
                    {formatStrain(board.strain)} &nbsp;
                    {board.getNsTrickCount()} / {board.getEwTrickCount()}
                </div>
            </div>
        );

        return (
            <>
                {header}
                <div className="board-layout play-table">
                    <div></div>
                    <div>{renderHand(Player.North, this.state.nCards, northVisible, northClickable)}</div>
                    <div></div>
                    <div>{renderHand(Player.West, this.state.wCards, westVisible, westClickable)}</div>
                    {trickDiv}
                    <div>{renderHand(Player.East, this.state.eCards, eastVisible, eastClickable)}</div>
                    <div></div>
                    <div>{renderHand(Player.South, this.state.sCards, southVisible, southClickable)}</div>
                    <div></div>
                </div>
            </>);
    }
}

function getCorrectPlays(board: Board): Card[] {
    const playsResult = new Wasm(Module).nextPlays(
        board.getTrickStartPbn(), board.strain, board.plays.map(p => p.card));

    return playsResult.getCorrectPlays();
}
