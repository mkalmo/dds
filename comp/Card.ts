export default class Card {

    constructor(public readonly rank: string,
                public readonly suit: string) {
    }

    static parse(cardAsString: string) {
        const [rank, suit] = cardAsString.split('');
        return new Card(rank, suit);
    }

    scalarRank(): number {
        const txt = this.rank;
        if (txt >= '2' && txt <= '9') return Number(txt);
        if (txt === 'T') return 10;
        if (txt === 'J') return 11;
        if (txt === 'Q') return 12;
        if (txt === 'K') return 13;
        if (txt === 'A') return 14;
        throw 'Invalid card symbol: ' + txt;
    }

    toString(): string {
        return this.rank + this.suit;
    }

}