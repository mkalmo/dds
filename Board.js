const _ = require('underscore');
const Module = require('./out.js');

var SUITS = ['S', 'H', 'D', 'C'];

var NEXT_PLAYER = {
    'N': 'E',
    'E': 'S',
    'S': 'W',
    'W': 'N'
};

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

nextPlays.cache = {};

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

class Board {
    constructor(pbn, strain) {
        this.cards = parsePBN(pbn);  // remaining cards in hands
        this.lastTrickPBN = pbn;
        this.firstPlayer = pbn[0];  // first to play comes directly from PBN.
        this.strain = strain;  // e.g. spades or no trump ('H', 'S', 'N', ...)
        this.player = this.firstPlayer;  // next to play
        this.plays = [];  // plays in this trick
        this.tricks = [];  // previous tricks. Array of CompleteTrick.
        this.ew_tricks = 0;
        this.ns_tricks = 0;
    }

    leader() {
        return this.plays.length ? this.plays[0].player : this.player;
    }

    isCompleted() {
        // return this.ew_tricks + this.ns_tricks === 13;
        let count = 0;
        for (const suit in this.cards) {
            for (const rank in this.cards[suit]) {
                count += this.cards[suit][rank].length;
            }
        }
        return count === 0;
    }

    // Play a card
    play(player, suit, rank) {
        if (player != this.player) {
            throw 'Played out of turn';
        }
        var holding = this.cards[player][suit];
        var idx = holding.indexOf(rank);
        if (idx == -1) {
            throw `${player} tried to play ${rank} ${suit} which was not in hand.`;
        }
        var legalPlays = this.legalPlays();
        if (!_.find(legalPlays, {player, suit, rank})) {
            throw `${suit} ${rank} by ${player} does not follow suit.`;
        }

        this.cards[player][suit].splice(idx, 1);
        this.plays.push({player, suit, rank});
        if (this.plays.length === 4) {
            this.sweep();
        } else {
            this.player = NEXT_PLAYER[player];
        }
    }

    // A trick has been completed. Determine the winner and advance the state.
    sweep() {
        if (this.plays.length !== 4) {
            throw 'Tried to sweep incomplete trick';
        }
        let topSuit = this.plays[0].suit,
            topRank = this.plays[0].rank,
            winner = this.plays[0].player;
        for (let i = 1; i < 4; i++) {
            let {suit, rank, player} = this.plays[i];
            if ((suit === topSuit && rank > topRank) ||
                (suit === this.strain && topSuit !== this.strain)) {
                topSuit = suit;
                topRank = rank;
                winner = player;
            }
        }

        let trick = {
            plays: this.plays,
            leader: this.plays[0].player,
            winner
        };
        this.tricks.push(trick);
        this.plays = [];
        this.player = winner;
        if (winner === 'N' || winner === 'S') {
            this.ns_tricks++;
        } else {
            this.ew_tricks++;
        }
        this.lastTrickPBN = this.toPBN();
    }

    // Returns an array of {player, suit, rank} objects.
    // TODO: replace this with a call to nextPlays()
    legalPlays() {
        var player = this.player;
        var followSuit = this.plays.length ? this.plays[0].suit : null;
        if (followSuit && this.cards[player][followSuit].length == 0) {
            followSuit = null;
        }

        var cards = this.cardsForPlayer(player);
        if (followSuit) {
            cards = cards.filter(({suit}) => suit == followSuit);
        }
        return cards.map(({suit, rank}) => ({player, suit, rank}));
    }

    // Interface to dds.js
    nextPlays() {
        return nextPlays(this.lastTrickPBN,
            this.strain,
            this.plays.map(formatCard));
    }

    // Returns an array of {suit, rank} objects.
    cardsForPlayer(player) {
        const cards = this.cards[player];
        return _.flatten(_.map(cards, (ranks, suit) => ranks.map(rank => ({suit, rank}))));
    }

    getDeclarer() {
        return NEXT_PLAYER[NEXT_PLAYER[NEXT_PLAYER[this.firstPlayer]]];
    }

    // Undo the last play
    undo() {
        var prevTricks = this.tricks.length,
            plays = this.plays.length;

        if (plays == 0) {
            if (prevTricks == 0) {
                throw 'Cannot undo play when no plays have occurred.';
            } else {
                prevTricks -= 1;
                plays = 3;
            }
        } else {
            plays--;
        }
        this.undoToPlay(prevTricks, plays);
    }

    // Undo to a previous position.
    // trickNum \in 0..12
    // playNum \in 0..3
    undoToPlay(trickNum, playNum) {
        // gather all the cards that have been played
        var cards = _.flatten(this.tricks.map(trick => trick.plays));
        cards = cards.concat(this.plays);

        // restore cards to hands
        for (var {player, suit, rank} of cards) {
            this.cards[player][suit].push(rank);
        }
        this.sortHands();

        // reset tricks & player
        this.player = this.firstPlayer;
        this.tricks = [];
        this.plays = [];
        this.ew_tricks = 0;
        this.ns_tricks = 0;
        this.lastTrickPBN = this.toPBN();

        // replay until the appropriate point
        for (var {player, suit, rank} of cards) {
            if (this.tricks.length == trickNum && this.plays.length == playNum) {
                break;
            }
            this.play(player, suit, rank);
        }
    }

    indexForCard(suit, rank) {
        for (var i = 0; i < this.tricks.length; i++) {
            var plays = this.tricks[i].plays;
            for (var j = 0; j < plays.length; j++) {
                var card = plays[j];
                if (card.suit == suit && card.rank == rank) {
                    return [i, j];
                }
            }
        }

        for (var j = 0; j < this.plays.length; j++) {
            var card = this.plays[j];
            if (card.suit == suit && card.rank == rank) {
                return [i, j];
            }
        }

        throw `Couldn't find played card ${rank} ${suit}`;
    }

    undoToCard(suit, rank) {
        var [trickNum, playNum] = this.indexForCard(suit, rank);
        this.undoToPlay(trickNum, playNum);
    }

    // Sort all holdings from highest to lowest rank
    sortHands() {
        for (var player in this.cards) {
            for (var suit in this.cards[player]) {
                this.cards[player][suit].sort((a, b) => b - a);
            }
        }
    }

    toPBN() {
        var player = this.player;
        var holdings = [];
        for (var i = 0; i < 4; i++) {
            var hand = this.cards[player];
            holdings.push(['S', 'H', 'D', 'C'].map(suit => hand[suit].map(rankToText).join('')).join('.'));
            player = NEXT_PLAYER[player];
        }
        return this.player + ':' + holdings.join(' ');
    }
}

function formatCard(card) {
    return rankToText(card.rank) + card.suit;
}

function parsePBNStrings(pbn) {
    var parts = pbn.split(' ');
    if (parts.length != 4) {
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
    Board: Board,
    nextPlays: nextPlays,
    textToRank: textToRank,
    compareCards: compareCards
};
