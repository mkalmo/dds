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

    public readonly player: string;
    private readonly plays: Play[];

    static fromRaw(raw: any) {
        const typed = raw as NextPlaysStruct;
        return new NextPlaysResult(typed.player, typed.plays);
    }

    constructor(player: string, plays: Play[]) {
        this.player = player;
        this.plays = plays;
    }

    getCardToPlay(): Card {
        const play = this.plays.reduce(
            (max, play) => play.score > max.score ? play : max,
            this.plays[0]);

        return new Card(play.rank, play.suit);
    }

// {
//     player: 'S',
//     tricks: { ns: 0, ew: 0 },
//     plays: [
//         { suit: 'H', rank: '2', equals: [], score: 3 },
//         { suit: 'S', rank: 'A', equals: [], score: 2 },
//         { suit: 'S', rank: 'Q', equals: [], score: 2 }
//     ]
// }

}