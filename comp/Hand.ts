import { Player } from "../constants.ts";

export default class Hand {

    constructor(private player: Player,
                private cards: string[]) {}

    getCardsOfSuit(suit: string): string[] {
        return this.cards
            .map(c => c.split(''))
            .filter(pair => pair[1] === suit)
            .map(pair => pair[0]);
    }
}