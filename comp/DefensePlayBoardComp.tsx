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
    wCards: Card[]
    nCards: Card[],
    plays: Play[]
    showLastTrick: boolean
    wrongCard: Card | undefined;
    showDummy: boolean;
}

export default class DefensePlayBoardComp extends Component<Props, State> {

    state: State = {
        wCards: [],
        nCards: [],
        plays: [],
        showLastTrick: false,
        wrongCard: undefined,
        showDummy: false
    }

    undoKeyHandler: (event: any) => void = undefined;

    async componentDidMount() {
        const board = this.props.board;

        this.undoKeyHandler = (event: any) => {
            if (event.key === 'Backspace') {

                board.undo([Player.West]);

                this.setState({ wrongCard: undefined });

                this.makeComputerMoveIfNeeded(); // first play only

                this.redrawBoard();
            }
        };

        window.addEventListener('keyup', this.undoKeyHandler);

        this.makeComputerMoveIfNeeded();

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

        this.makeComputerMoveIfNeeded();

        this.redrawBoard();
    }

    makeComputerMoveIfNeeded(): void {
        const board = this.props.board;

        let maxMoves = 4 - board.plays.length; // do not start next trick.
                                               // trick should be visible
        while (this.shouldAutoPlay() && maxMoves > 0) {
            const opponent: Player = board.player;
            const opponentCard = getCorrectPlays(board)[0];

            board.play(opponent, opponentCard);

            maxMoves--;
        }
    }

    shouldAutoPlay(): boolean {
        return this.props.board.player !== Player.West;
    }

    redrawBoard() {
        const board = this.props.board;

        const wCards = board.deal.getPlayerCards(Player.West);
        const nCards = board.deal.getPlayerCards(Player.North);

        let plays = board.plays;

        if (board.plays.length === 0 && board.getLastTrick() !== undefined) {
            // Show last trick, otherwise can't see opponents last play
            plays = board.getLastTrick().getPlays();
        }

        // Show dummy (North) after first card is played
        const showDummy = board.tricks.length > 0 || board.plays.length > 0;

        this.setState({ wCards, nCards, plays, showDummy });
    }

    render() {

        const board = this.props.board;

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span className='suit'>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        const onTrickClickFunc = () => {
            this.makeComputerMoveIfNeeded();
            this.redrawBoard();
        };

        const getPlay = (player: Player) => {
            return this.state.plays
                .filter((play) => play.player === player)
                .map(p => formatCard(p.card))[0];
        }

        return (
            <>
                <div className='play-table-header'>
                    <Link to={'/'}>Back</Link>
                    <div>
                        Defense Practice - {formatStrain(board.strain)} &nbsp;
                        {board.getEwTrickCount()} / {board.getNsTrickCount()}
                    </div>
                </div>
                <div className="defence-layout play-table">
                    <div></div>
                    <div>
                        {this.state.showDummy ? (
                            <PlayHandComp cardClickAction={() => {}} // Dummy cards not clickable
                                          isValidPlayFunc={() => false}
                                          isBadPlayFunc={() => false}
                                          cards={this.state.nCards}/>
                        ) : (
                            <div>Dummy</div>
                        )}
                    </div>
                    <div></div>

                    <div>
                        <PlayHandComp cardClickAction={c => this.playCard(c)}
                                      isValidPlayFunc={c => board.isValidPlay(c)}
                                      isBadPlayFunc={c => c.equals(this.state.wrongCard)}
                                      cards={this.state.wCards}/>
                    </div>

                    <div>

                        <div className="trick" onClick={ onTrickClickFunc }>
                            <div className="north">{ getPlay(Player.North) }</div>
                            <div className="west" >{ getPlay(Player.West) }</div>
                            <div className="east" >{ getPlay(Player.East) }</div>
                            <div className="south">{ getPlay(Player.South) }</div>
                        </div>
                    </div>

                    <div>
                        <div>East</div>
                    </div>

                    <div></div>
                    <div>
                        <div>Declarer</div>
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
