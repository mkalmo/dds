
export default class Hand {

    constructor(private cards: string[]) {}

    getCardsOfSuit(suit: string): string[] {
        return this.cards
            .map(c => c.split(''))
            .filter(pair => pair[1] === suit)
            .map(pair => pair[0]);
    }
}