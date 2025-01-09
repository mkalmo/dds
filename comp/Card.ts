import { SUIT_RANKS1 } from "../constants.ts";

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
        if (rankText >= '2' && rankText <= '9') return Number(rankText);
        const rankMap = new Map<string, number>([
            ['T', 10],
            ['J', 11],
            ['Q', 12],
            ['K', 13],
            ['A', 14]
        ]);

        if (!rankMap.has(rankText)) {
            throw 'Invalid card symbol: ' + rankText;
        } else {
            return rankMap.get(rankText);
        }
    }

    toString(): string {
        return this.rank + this.suit;
    }

}