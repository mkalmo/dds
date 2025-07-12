import React, { Component } from 'react';
import { Player, Strain } from "../modules/constants.ts";
import PlayHandComp from "./PlayHandComp.tsx";
import Card from "../modules/Card.ts";
import Board from "../modules/Board.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import { formatStrain } from "../modules/common.ts";
import { Play } from "../modules/types.ts";
import { Link } from "react-router-dom";

declare var Module: DDSModule;

type Props = {
    board: Board
}

type State = {
    nCards: Card[]
    sCards: Card[],
    plays: Play[]
    showLastTrick: boolean
    wrongCard: Card | undefined;
}

export default class PlayBoardComp extends Component<Props, State> {

    state: State = {
        nCards: [],
        sCards: [],
        plays: [],
        showLastTrick: false,
        wrongCard: undefined
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {

                board.undo();

                this.makeOpponentMoveIfNeeded(); // first play only

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

        if (getCorrectPlays(board).find(each => each.equals(card)) === undefined
            && !card.equals(this.state.wrongCard)) { // accept on second click

            this.setState({wrongCard: card});

            return;
        }

        this.setState({wrongCard: undefined});

        board.play(board.player, card);

        this.makeOpponentMoveIfNeeded();

        this.refreshBoard();
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
        if (!board.isOpponentsTurn()) {
            this.refreshBoard();
            return;
        }

        const opponent: Player = board.player;
        let opponentCard = getCorrectPlays(board)[0];

        if (opponentCard.equals(Card.parse('6H'))) {
            opponentCard = Card.parse('2S');
        }

        board.play(opponent, opponentCard);

        this.refreshBoard();
    }

    refreshBoard() {
        const board = this.props.board;

        const nCards = board.deal.getPlayerCards(Player.North);
        const sCards = board.deal.getPlayerCards(Player.South);

        let plays = board.plays;

        if (board.plays.length === 0 && board.getLastTrick() !== undefined) {
            // Show last trick, otherwise can't see opponents last play
            plays = board.getLastTrick().getPlays();
        }

        this.setState({ nCards, sCards, plays });
    }

    render() {

        const board = this.props.board;

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span className='suit'>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        const onTrickClickFunc = () => {
            this.makeOpponentMoveIfNeeded();
            this.refreshBoard();
        };

        return (
            <>
                <div className='play-table-header'>
                    <Link to={'/'}>Back</Link>
                    <div>
                        {formatStrain(board.strain)} &nbsp;
                        {board.getNsTrickCount()} / {board.getEwTrickCount()}
                    </div>
                </div>
                <div className="play-table">
                    <div>
                        <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => board.isValidPlay(c)}
                                      isBadPlayFunc={c => c.equals(this.state.wrongCard)}
                                      cards={this.state.nCards}/>
                    </div>
                    <div>
                        <div onClick={ onTrickClickFunc }>
                            {this.state.plays.map(play => <div>
                                <span className='player'>{play.player}&nbsp;</span>
                                {formatCard(play.card)} </div>)}
                        </div>
                    </div>
                    <div>
                        <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => board.isValidPlay(c)}
                                      isBadPlayFunc={c => c.equals(this.state.wrongCard)}
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
