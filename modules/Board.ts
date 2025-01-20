import { NEXT_PLAYER, Player, Strain } from './constants.ts';
import Deal from "./Deal.ts";
import Card from "./Card.ts";
import Trick from "./Trick.ts";
import { Play } from "./types.ts";

export class Board {
    public deal: Deal;
    public player: Player;
    public plays: Play[];
    public tricks: Trick[];
    public trickStartPbns: string[];

    constructor(initialPbn: string,
                public readonly strain: Strain) {

        this.deal = Deal.fromPBN(initialPbn);  // remaining cards in hands
        this.player = Player.fromString(initialPbn[0]);  // first to play comes directly from PBN.
        this.plays = [];  // plays in this trick
        this.tricks = [];  // previous tricks. Array of CompleteTrick.
        this.trickStartPbns = [initialPbn];
    }

    isCompleted() {
        return this.deal.cardCount() === 0;
    }

    play(player: Player, card: Card) {
        this.deal.removeCard(player, card);

        this.plays.push({ player, card });

        if (this.plays.length === 4) {
            this.sweep();
        } else {
            this.player = NEXT_PLAYER.get(player);
        }
    }

    sweep() {
        const trick = new Trick(this.strain, this.plays);
        const winner = trick.winner();

        this.tricks.push(trick);
        this.trickStartPbns.push(this.deal.toPBN(winner));
        this.player = winner;
        this.plays = [];
    }

    getNsTrickCount(): number {
        return this.tricks
            .filter(t => t.winner() === Player.North
                || t.winner() === Player.South).length
    }

    getEwTrickCount(): number {
        return this.tricks
            .filter(t => t.winner() === Player.East
                || t.winner() === Player.West).length
    }

    getTrickStartPbn(): string {
        return this.trickStartPbns[this.trickStartPbns.length - 1];
    }

    isValidPlay(card: Card): boolean {
        const cards = this.deal.getPlayerCards(this.player);

        if (cards.length === 0) {
            return false;
        }

        const playerHasTheCard = cards
            .find(c => c.toString() === card.toString()) !== undefined;

        const leadSuit = this.plays.length ? this.plays[0].card.suit : undefined;

        if (!playerHasTheCard) {
            return false;
        } else if (playerHasTheCard && (leadSuit === undefined || card.suit === leadSuit)) {
            return true;
        }

        const playerSuitCount = cards.filter(c => c.suit === leadSuit).length;

        return playerSuitCount === 0 || card.suit === leadSuit;
    }

    isOpponentsTurn(): boolean {
        return this.player === Player.West
            || this.player === Player.East
    }

    getLastTrick(): Trick {
        return this.tricks[this.tricks.length - 1];
    }

    undoTrick(): void {
        if (this.plays.length > 0) {
            this.undoPlayedCards();
        } else if (this.tricks.length > 0) {
            this.trickStartPbns.pop();

            this.undoPlayedCards();
        }
    }

    private undoPlayedCards(): void {
        const pbn = this.getTrickStartPbn();

        this.deal = Deal.fromPBN(pbn);
        this.player = Player.fromString(pbn[0]);
        this.plays = [];
    }
}