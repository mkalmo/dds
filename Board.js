const _ = require("underscore");

const { parsePBN, nextPlays, formatCard } = require('./functions.js');
const { NEXT_PLAYER } = require('./constants.js');

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

module.exports = Board;