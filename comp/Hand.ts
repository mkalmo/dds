import { Player, Suit } from "../constants.ts";
import Card from "./Card.ts";

export default class Hand {

    constructor(public player: Player,
                private cards: Card[]) {}

    getCardsOfSuit(suit: Suit): string[] {
        return this.cards
            .filter(pair => pair[1] === suit)
            .map(pair => pair[0]);
    }
}