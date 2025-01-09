import { nextPlays, calcDDTable, textToRank, compareCards } from '../functions.ts';
import { Board } from "../Board.ts";
import _ from 'underscore';

import NextPlaysResult from "../comp/NextPlaysResult.ts";
// import Board from '../Board.js';

const pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4';
// const pbn = 'S:AQ.2.. 94.4.. 67.A.. KJ.3..';
// const result = nextPlays(pbn, 'N', ['5D', '2D', 'QD']);
// const result = nextPlays(pbn, 'S', []);
// console.log(result);

const result = calcDDTable(pbn);
console.log(result);
// console.log(parsePBN(pbn));

const board = new Board(pbn, 'D');

let c = 70;
while (!board.isCompleted() && (c-- > 0)) {
    const playsResult = board.nextPlays();

    const card = playsResult.getCardToPlay();

    board.play(playsResult.player, card);
}

console.log(board.ns_tricks);

console.log(board.tricks.map(t => t.toString()).join("\n"));
