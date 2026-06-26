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

type Mode = 'declarer' | 'defence_e' | 'defence_w' | 'manual';

type Props = {
    board: Board,
    mode: Mode
}

type State = {
    mode: Mode;
    nCards: Card[]
    sCards: Card[],
    eCards: Card[],
    wCards: Card[],
    plays: Play[]
    showLastTrick: boolean
    wrongCard: Card | undefined;
    showDummy: boolean;
}

export default class PlayBoardComp extends Component<Props, State> {

    state: State = {
        mode: this.props.mode,
        nCards: [],
        sCards: [],
        eCards: [],
        wCards: [],
        plays: [],
        showLastTrick: false,
        wrongCard: undefined,
        showDummy: false
    }

    get isManual(): boolean {
        return this.state.mode === 'manual';
    }

    get isDefense(): boolean {
        return this.state.mode === 'defence_e' || this.state.mode === 'defence_w';
    }

    get defensePlayer(): Player | undefined {
        if (this.state.mode === 'defence_w') return Player.West;
        if (this.state.mode === 'defence_e') return Player.East;
        return undefined;
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {

                if (this.isManual) {
                    board.undoPlay();
                } else if (this.isDefense) {
                    board.undo([this.defensePlayer]);
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

        if (this.isManual || board.isCompleted()) {
            return;
        }

        if (this.isDefense) {
            let maxMoves = 4 - board.plays.length;
            while (board.player !== this.defensePlayer && maxMoves > 0) {
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

    setMode = (mode: Mode) => {
        this.setState({ mode, wrongCard: undefined }, () => {
            if (!this.isManual) {
                this.makeOpponentMoveIfNeeded();
                this.redrawBoard();
            }
        });
    }

    render() {

        const board = this.props.board;
        const mode = this.state.mode;

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

        const renderHand = (player: Player, cards: Card[]) => {
            let visible: boolean;
            let clickable: boolean;

            if (player === Player.North) {
                visible = !this.isDefense || this.state.showDummy;
                clickable = !this.isDefense || this.isManual;
            } else if (player === Player.South) {
                visible = !this.isDefense || this.isManual;
                clickable = visible;
            } else if (player === Player.West) {
                visible = this.state.mode === 'defence_w' || this.isManual;
                clickable = visible;
            } else {
                visible = this.state.mode === 'defence_e' || this.isManual;
                clickable = visible;
            }

            if (!visible) return null;
            return (
                <PlayHandComp
                    cardClickAction={clickable ? (c) => this.playCard(c) : () => {}}
                    isValidPlayFunc={clickable ? (c) => isValidPlayForPlayer(c, player) : () => false}
                    isBadPlayFunc={clickable ? (c) => isBadPlayForPlayer(c, player) : () => false}
                    cards={cards}/>
            );
        };

        const modeLink = (targetMode: Mode, label: string) =>
            mode === targetMode
                ? <span>{label}</span>
                : <span onClick={() => this.setMode(targetMode)} style={{cursor: 'pointer'}}>{label}</span>;

        const score = this.isDefense
            ? <>{board.getEwTrickCount()} / {board.getNsTrickCount()}</>
            : <>{board.getNsTrickCount()} / {board.getEwTrickCount()}</>;

        const header = (
            <div className='play-table-header'>
                <div>
                    <Link to={'/'}>Back</Link>&nbsp;
                    {modeLink('declarer', 'D')}&nbsp;
                    {modeLink('defence_w', 'W')}&nbsp;
                    {modeLink('defence_e', 'E')}&nbsp;
                    {modeLink('manual', 'M')}
                </div>
                <div>
                    {formatStrain(board.strain)} &nbsp;
                    {score}
                </div>
            </div>
        );

        return (
            <>
                {header}
                <div className="board-layout play-table">
                    <div></div>
                    <div>{renderHand(Player.North, this.state.nCards)}</div>
                    <div></div>
                    <div>{renderHand(Player.West, this.state.wCards)}</div>
                    {trickDiv}
                    <div>{renderHand(Player.East, this.state.eCards)}</div>
                    <div></div>
                    <div>{renderHand(Player.South, this.state.sCards)}</div>
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
