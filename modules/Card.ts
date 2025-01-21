import { RANKS, Suit, SUIT_RANKS1, Suits, SUITS } from "./constants.ts";

export default class Card {

    public readonly scalarRank: number;

    constructor(public readonly rank: string,
                public readonly suit: string) {
        this.scalarRank = this.getScalarRank(rank);
    }

    static parse(cardAsString: string): Card {
        const [rank, suit] = cardAsString.split('');

        if (Suits.find(s => s.toString() === suit) === undefined) {
            throw new Error(`Invalid suit: ${cardAsString}`);
        }
        if (RANKS.find(r => r === rank) === undefined) {
            throw new Error(`Invalid rank: ${cardAsString}`);
        }

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
        const index = RANKS.indexOf(rankText);

        if (index === -1) {
            throw 'Invalid card symbol: ' + rankText;
        } else {
            return index + 2;
        }
    }

    toString(): string {
        return this.rank + this.suit;
    }

    equals(other: Card): boolean {
        return this.rank === other.rank && this.suit === other.suit;
    }

}