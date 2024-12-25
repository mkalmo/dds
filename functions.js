const _ = require('underscore');
const Module = require('./out.js');
const { NEXT_PLAYER } = require('./constants.js');

const SUITS = ['S', 'H', 'D', 'C'];

const _solveBoard = Module.cwrap('solve',
    'string',
    ['string', 'string', 'number', 'number']);


function packPlays(plays) {
    const SUITS1 = {'S': 0, 'H': 1, 'D': 2, 'C': 3};
    const RANKS1 = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
        '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11,
        'Q': 12, 'K': 13, 'A': 14};

    const buf = Module._malloc(8 * plays.length);
    for (let i = 0; i < plays.length; i++) {
        const p = plays[i];
        if (p.length !== 2) {
            throw 'Invalid play: ' + p;
        }
        const suit = SUITS1[p[1]],
            rank = RANKS1[p[0]];

        Module.setValue(buf + i * 8, suit, 'i32');
        Module.setValue(buf + i * 8 + 4, rank, 'i32');
    }

    return buf;
}

function nextPlays(board, trump, plays) {
    const playsPtr = packPlays(plays);

    return JSON.parse(_solveBoard(board, trump, plays.length, playsPtr));
}

function textToRank(txt) {
    if (txt.length !== 1) {
        throw 'Invalid card symbol: ' + txt;
    }
    if (txt >= '2' && txt <= '9') return Number(txt);
    if (txt === 'T') return 10;
    if (txt === 'J') return 11;
    if (txt === 'Q') return 12;
    if (txt === 'K') return 13;
    if (txt === 'A') return 14;
    throw 'Invalid card symbol: ' + txt;
}

function formatCard(card) {
    return rankToText(card.rank) + card.suit;
}

function formatTrick(trick) {
    const parts = [];
    for (const play of trick.plays) {
        parts.push(formatCard(play));
    }

    return trick.leader + ' ' + parts.join(',') + ' ' + trick.winner;
}

function parsePBNStrings(pbn) {
    var parts = pbn.split(' ');
    if (parts.length !== 4) {
        throw 'PBN must have four hands (got ' + parts.length + ')';
    }

    var m = parts[0].match(/^([NSEW]):/);
    if (!m) {
        throw 'PBN must start with either "N:", "S:", "E:" or "W:"';
    }
    parts[0] = parts[0].slice(2);
    var player = m[1];
    var hands = {};
    parts.forEach((txt, i) => {
        hands[player] = txt;
        player = NEXT_PLAYER[player];
    });
    return hands;
}

function parsePBN(pbn) {
    var textHands = parsePBNStrings(pbn);

    var deal = {};
    _.each(textHands, (txt, player) => {
        deal[player] = {};
        var suits = txt.split('.');
        if (suits.length != 4) {
            throw `${player} must have four suits, got ${suits.length}: ${txt}`;
        }
        suits.forEach((holding, idx) => {
            deal[player][SUITS[idx]] = [].map.call(holding, textToRank);
        });
    });
    return deal;
}

const SUIT_RANKS = {'S': 0, 'H': 1, 'D': 2, 'C': 3};

function rankToText(rank) {
    if (rank < 10) return '' + rank;
    else if (rank === 10) return 'T';
    else if (rank === 11) return 'J';
    else if (rank === 12) return 'Q';
    else if (rank === 13) return 'K';
    else if (rank === 14) return 'A';
    throw 'Invalid card rank: ' + rank;
}

function compareCards(a, b) {
    if (a.suit !== b.suit) {
        return SUIT_RANKS[a.suit] - SUIT_RANKS[b.suit];
    } else {
        return a.rank - b.rank;
    }
}

module.exports = {
    nextPlays,
    textToRank,
    compareCards,
    formatCard,
    parsePBN,
    nextPlays,
    formatCard,
    formatTrick
};
