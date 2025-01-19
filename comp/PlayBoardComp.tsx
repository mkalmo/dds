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
    sCards: Card[]
}

export default class PlayBoardComp extends Component<Props, {}> {

    state: State = {
        nCards: [],
        sCards: []
    }

    async componentDidMount() {
        const board = this.props.board;

        console.log('board', board.lastTrickPBN);

        makeOpponentMove(board);

        this.updateState();
    }

    playCard(card: Card): void {
        const board = this.props.board;

        console.log('player: ', board.player, ' card: ', card);
        board.play(board.player, card);

        if (board.player === Player.West || board.player === Player.East) {
            makeOpponentMove(board);
        }

        this.updateState();
    }

    updateState() {
        const board = this.props.board;

        this.state.nCards = board.cards.getPlayerCards(Player.North);
        this.state.sCards = board.cards.getPlayerCards(Player.South);

        this.setState({});
    }

    render() {

        const formatCard = (c: Card) => <React.Fragment key={c.toString()}>
            {c.rank}
            <span>{ formatStrain(c.suit as Strain) } </span>
        </React.Fragment>;

        return (
            <div className="play-table">
                <div>
                    <PlayHandComp cardClickAction={c => this.playCard(c)}
                                  enabled={this.props.board.player === Player.North}
                                  cards={this.state.nCards}/>
                </div>
                <div>
                    <div className="hand">
                        { this.props.board.plays.map(p => formatCard(p.card)) }
                    </div>
                </div>
                <div>
                    <PlayHandComp cardClickAction={c => this.playCard(c)}
                                  enabled={this.props.board.player === Player.South}
                                  cards={this.state.sCards}/>
                </div>
            </div>);
    }
}
