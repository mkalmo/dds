const { nextPlays, textToRank,
        compareCards, formatTrick } = require('./functions.js');
const Board = require('./Board.js');
const _ = require('underscore');

//const pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4';
const pbn = 'S:AQ.2.. 94.4.. 67.A.. KJ.3..';
// const result = nextPlays(pbn, 'N', ['5D', '2D', 'QD']);
// const result = nextPlays(pbn, 'S', []);
// console.log(result);

const board = new Board(pbn, 'S');
// console.log(b.getDeclarer());
while (!board.isCompleted()) {
    const playsStruct = board.nextPlays();
    const plays = playsStruct.plays.map(x => _.extend({}, x, {rank: textToRank(x.rank)}));
    plays.sort((a, b) => -compareCards(a, b));
    const play = _.max(plays, p => p.score);
    board.play(board.player, play.suit, play.rank);
}

// console.log(board.tricks);

for (const trick of board.tricks) {
    console.log(formatTrick(trick));
}

