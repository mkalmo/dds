import { Player } from "./constants.ts";
import Card from "./Card.ts";

type Play =  {
    suit: string
    rank: string
    equals: string[]
    score: number
}

type NextPlaysStruct = {
    player: string
    plays: Play[]
}

export default class NextPlaysResult {

    public readonly player: Player;
    public readonly plays: Play[];

    static fromRaw(raw: any): NextPlaysResult {
        const typed = raw as NextPlaysStruct;
        return new NextPlaysResult(Player.fromString(typed.player), typed.plays);
    }

    constructor(player: Player, plays: Play[]) {
        this.player = player;
        this.plays = plays;
    }

    getCorrectPlays(): Card[] {
        const scores = this.plays.map(p => p.score);

        const max = Math.max(...scores);

        const playToCards = (play: Play) =>
            [play.rank, ...play.equals]
                .sort()
                .map(rank => new Card(rank, play.suit));

        return this.plays
            .filter(play => play.score === max)
            .flatMap(play => playToCards(play));
    }


}