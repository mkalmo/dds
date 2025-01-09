import { Play } from "./types.ts";

export default class Trick {

    private plays: Play[] = [];

    constructor(private strain: string, plays: Play[]) {
        if (plays.length > 4) {
            throw Error('incomplete trick');
        }

        this.plays = plays;
    }

    toString(): string {
        return this.plays[0].player
            + ':'
            + this.plays.map(p => p.card).join(',')
            + '->'
            + this.winner();
    }

    public winner(): string {
        let topSuit = this.plays[0].card.suit,
            topRank = this.plays[0].card.scalarRank(),
            winner = this.plays[0].player;
        for (let i = 1; i < 4; i++) {
            let suit = this.plays[i].card.suit,
                rank = this.plays[i].card.scalarRank(),
                player = this.plays[i].player;

            if ((suit === topSuit && rank > topRank) ||
                (suit === this.strain && topSuit !== this.strain)) {
                topSuit = suit;
                topRank = rank;
                winner = player;
            }
        }

        return winner;
    }
}