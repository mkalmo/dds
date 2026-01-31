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
    board: Board
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
        manualMode: false
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {

                if (this.state.manualMode) {
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

        if (!board.isOpponentsTurn()) {
            return;
        }

        const opponent: Player = board.player;
        const opponentCard = getCorrectPlays(board)
            .sort((a, b) => a.scalarRank - b.scalarRank)[0];

        board.play(opponent, opponentCard);
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

        this.setState({ nCards, sCards, eCards, wCards, plays });
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

        return (
            <>
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
                <div className="board-layout play-table">
                    <div></div>
                    <div>
                        <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => isValidPlayForPlayer(c, Player.North)}
                                      isBadPlayFunc={c => isBadPlayForPlayer(c, Player.North)}
                                      cards={this.state.nCards}/>
                    </div>
                    <div></div>
                    <div>
                        {manualMode && <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => isValidPlayForPlayer(c, Player.West)}
                                      isBadPlayFunc={c => isBadPlayForPlayer(c, Player.West)}
                                      cards={this.state.wCards}/>}
                    </div>
                    {trickDiv}
                    <div>
                        {manualMode && <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => isValidPlayForPlayer(c, Player.East)}
                                      isBadPlayFunc={c => isBadPlayForPlayer(c, Player.East)}
                                      cards={this.state.eCards}/>}
                    </div>
                    <div></div>
                    <div>
                        <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => isValidPlayForPlayer(c, Player.South)}
                                      isBadPlayFunc={c => isBadPlayForPlayer(c, Player.South)}
                                      cards={this.state.sCards}/>
                    </div>
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
