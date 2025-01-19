import { NEXT_PLAYER, Player } from './constants.ts';
import Deal from "./Deal.ts";
import NextPlaysResult from "./NextPlaysResult.ts";
import Card from "./Card.ts";
import Trick from "./Trick.ts";
import { Play } from "./types.ts";

export class Board {
    public readonly cards: Deal;
    public lastTrickPBN: string;
    private readonly firstPlayer: string;
    private readonly strain: string;
    private player: string;
    public plays: Play[];
    public tricks: Trick[];
    public ew_tricks: number;
    public nsTricks: number;

    constructor(pbn: string, strain: string) {
        this.cards = Deal.fromPBN(pbn);  // remaining cards in hands
        this.lastTrickPBN = pbn;
        this.firstPlayer = pbn[0];  // first to play comes directly from PBN.
        this.strain = strain;  // e.g. spades or no trump ('H', 'S', 'N', ...)
        this.player = this.firstPlayer;  // next to play
        this.plays = [];  // plays in this trick
        this.tricks = [];  // previous tricks. Array of CompleteTrick.
        this.ew_tricks = 0;
        this.nsTricks = 0;
    }

    leader() {
        return this.plays.length ? this.plays[0].player : this.player;
    }

    isCompleted() {
        return this.cards.cardCount() === 0;
    }

    play(player: string, card: Card) {
        this.cards.removeCard(Player.fromString(player), card);

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
            this.ew_tricks++;
        }
        this.lastTrickPBN = this.cards.toPBN(Player.fromString(this.player));
    }

    // nextPlays(): NextPlaysResult {
    //     const raw = nextPlays(this.lastTrickPBN,
    //         this.strain,
    //         this.plays.map(p => p.card.toString()));
    //
    //     if (raw['error']) {
    //         throw Error('nextPlays(): ' + raw['message']);
    //     }
    //
    //     return NextPlaysResult.fromRaw(raw);
    // }

    getDeclarer() {
        return NEXT_PLAYER.get(NEXT_PLAYER.get(NEXT_PLAYER.get(this.firstPlayer)));
    }

}