import { NEXT_PLAYER, Player, Strain } from './constants.ts';
import Deal from "./Deal.ts";
import Card from "./Card.ts";
import Trick from "./Trick.ts";
import { Play } from "./types.ts";

export class Board {
    public readonly cards: Deal;
    public lastTrickPBN: string;
    public readonly strain: Strain;
    public player: Player;
    public plays: Play[];
    public tricks: Trick[];
    public ewTricks: number;
    public nsTricks: number;

    constructor(pbn: string, strain: Strain) {
        this.cards = Deal.fromPBN(pbn);  // remaining cards in hands
        this.lastTrickPBN = pbn;
        this.strain = strain;  // e.g. spades or no trump ('H', 'S', 'N', ...)
        this.player = Player.fromString(pbn[0]);  // first to play comes directly from PBN.
        this.plays = [];  // plays in this trick
        this.tricks = [];  // previous tricks. Array of CompleteTrick.
        this.ewTricks = 0;
        this.nsTricks = 0;
    }

    leader() {
        return this.plays.length ? this.plays[0].player : this.player;
    }

    isCompleted() {
        return this.cards.cardCount() === 0;
    }

    play(player: Player, card: Card) {
        this.cards.removeCard(player, card);

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
        this.player = winner;
        this.plays = [];

        if (winner === 'N' || winner === 'S') {
            this.nsTricks++;
        } else {
            this.ewTricks++;
        }
        this.lastTrickPBN = this.cards.toPBN(Player.fromString(this.player));
    }

    isValidPlay(card: Card): boolean {
        const cards = this.cards.getPlayerCards(this.player);

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
}