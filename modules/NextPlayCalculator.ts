import Card from "./Card.ts";
import NextPlaysResult from "./NextPlaysResult.ts";
import { Player, Strain } from "./constants.ts";
import Deal from "./Deal.ts";

export default class NextPlayCalculator {

    constructor(
        private readonly nextPlays: NextPlaysResult,
        private readonly deal: Deal,
        private readonly strain: Strain) {
    }

    getNextPlay(): Card {
        const correctPlays = this.nextPlays.getCorrectPlays();

        if (this.ourTurn() && this.opponentsHaveTrumps()) {
            return correctPlays
                .find(card => card.suit === this.strain)
                || correctPlays[0];
        }

        return correctPlays[0];
    }

    private ourTurn(): boolean {
        return this.nextPlays.player === Player.North
            || this.nextPlays.player === Player.South;
    }

    private getOpponentCards(): Card[] {
        return [Player.East, Player.West]
            .flatMap(player => this.deal.getPlayerCards(player));
    }

    private opponentsHaveTrumps(): boolean {
        return this.getOpponentCards()
            .find(c => c.suit === this.strain) !== undefined;
    }
}