// const NEXT_PLAYER1 = {
//     'N': 'E',
//     'E': 'S',
//     'S': 'W',
//     'W': 'N'
// };

export const NEXT_PLAYER = new Map<string, string>(
    [['N', 'E'],
    ['E', 'S'],
    ['S', 'W'],
    ['W', 'N']]);

export enum Player {
    North = 'N',
    East = 'E',
    South = 'S',
    West = 'W'
}

export namespace Player {
    export function fromString(valueAsString: string): Player {
        if (!Object.values(Player).includes(valueAsString as Player)) {
            throw new Error('bad value: ' + valueAsString);
        }

        return Object.values(Player)
            .find(v => v === valueAsString) as Player;
    }
}

export const Players = [
    Player.North,
    Player.East,
    Player.South,
    Player.West
];


export const SUITS = ['S', 'H', 'D', 'C'];

export enum Suit {
    Spades = 'S',
    Harts = 'H',
    Diamonds = 'D',
    Clubs = 'C'
}

export namespace Suit {
    export function fromString(valueAsString: string): Suit {
        if (!Object.values(Suit).includes(valueAsString as Suit)) {
            throw new Error('bad value: ' + valueAsString);
        }

        return Object.values(Suit)
            .find(v => v === valueAsString) as Suit;
    }
}

export const Suits = [
    Suit.Spades,
    Suit.Harts,
    Suit.Diamonds,
    Suit.Clubs
];


export const SUIT_RANKS = {'S': 0, 'H': 1, 'D': 2, 'C': 3};

export const SUIT_RANKS1 = new Map<string, number>([
    ['S', 0],
    ['H', 1],
    ['D', 2],
    ['C', 3]
]);

