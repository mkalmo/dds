import Hand from "./Hand.ts";

export default class Deal {

    constructor(public readonly nHand: Hand,
                public readonly eHand: Hand,
                public readonly sHand: Hand,
                public readonly wHand: Hand) {}
}