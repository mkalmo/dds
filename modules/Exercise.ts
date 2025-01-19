import Trick from "./Trick.ts";
import Card from "./Card.ts";
import Deal from "./Deal.ts";
import { Strain } from "./constants.ts";

export default class Exercise {
    constructor(
        public readonly deal: Deal,
        public readonly strain: Strain,
        public readonly target: number,
        public readonly tricks: Trick[]
    ) {}

    getLead(): Card {
        return this.tricks[0].getLeadCard();
    }
}