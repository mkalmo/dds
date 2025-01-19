import { SUIT_RANKS1 } from "./constants.ts";

export default class Card {

    public readonly scalarRank: number;

    constructor(public readonly rank: string,
                public readonly suit: string) {
        this.scalarRank = this.getScalarRank(rank);
    }

    static parse(cardAsString: string) {
        const [rank, suit] = cardAsString.split('');
        return new Card(rank, suit);
    }

    compareTo(other: Card): number {
        const result = SUIT_RANKS1.get(this.suit) - SUIT_RANKS1.get(other.suit);

        if (result !== 0) {
            return result;
        }

        return other.scalarRank - this.scalarRank;
    }

    private getScalarRank(rankText: string): number {
        const index = '23456789TJQKA'.split('').indexOf(rankText);

        if (index === -1) {
            throw 'Invalid card symbol: ' + rankText;
        } else {
            return index + 1;
        }
    }

    toString(): string {
        return this.rank + this.suit;
    }

}