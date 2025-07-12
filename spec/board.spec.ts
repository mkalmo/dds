import { expect, test } from '@jest/globals';
import Board from "../modules/Board.ts";
import { Player, Suit } from "../modules/constants.ts";
import Card from "../modules/Card.ts";

test('Checks if play is valid', () => {

    const pbn = 'W:2...J 3...Q ...K8 5...A';

    const board = new Board(pbn, Suit.Spades);

    board.play(Player.West, Card.parse('2S'));

    expect(board.isValidPlay(Card.parse('5S'))).toBe(false);
    expect(board.isValidPlay(Card.parse('QC'))).toBe(false);
    expect(board.isValidPlay(Card.parse('3S'))).toBe(true);

    board.play(Player.North, Card.parse('3S'));

    expect(board.isValidPlay(Card.parse('3S'))).toBe(false);
    expect(board.isValidPlay(Card.parse('KC'))).toBe(true);
});

test('Generates valid trick start Pbn (for solver)', () => {

    const pbn = 'W:2...J 3...Q 4...K 5...A';

    const board = new Board(pbn, Suit.Spades);

    board.play(Player.West, Card.parse('2S'));
    board.play(Player.North, Card.parse('3S'));
    board.play(Player.East, Card.parse('4S'));

    expect(board.getTrickStartPbn())
        .toBe(pbn);

    board.play(Player.South, Card.parse('5S'));

    expect(board.getTrickStartPbn())
        .toBe('S:...A ...J ...Q ...K');

    board.play(Player.South, Card.parse('AC'));

    expect(board.getTrickStartPbn())
        .toBe('S:...A ...J ...Q ...K');
});

test('Tells whether it is opponents turn', () => {
    const pbn = 'W:2...J 3...Q ...K8 5...A';

    const board = new Board(pbn, Suit.Spades);

    expect(board.isOpponentsTurn()).toBe(true);

    board.play(Player.West, Card.parse('2S'));

    expect(board.isOpponentsTurn()).toBe(false);

    board.play(Player.North, Card.parse('3S'));

    expect(board.isOpponentsTurn()).toBe(true);
});

test('Returns last trick', () => {
    const pbn = 'W:2...J 3...Q 4...K 5...A';
    const board = new Board(pbn, Suit.Spades);
    board.play(Player.West, Card.parse('2S'));
    board.play(Player.North, Card.parse('3S'));

    expect(board.getLastTrick()).toBeUndefined();

    board.play(Player.East, Card.parse('4S'));
    board.play(Player.South, Card.parse('5S'));

    expect(board.getLastTrick()).toBeDefined();
});

test('Board supports undoing last play', () => {

    const pbn = 'W:2...J 3...Q 4...K 5...A';

    const board = new Board(pbn, Suit.Spades);
    board.play(Player.West, Card.parse('2S'));
    board.play(Player.North, Card.parse('3S'));
    board.play(Player.East, Card.parse('4S'));
    board.play(Player.South, Card.parse('5S'));
    board.play(Player.South, Card.parse('AC'));

    expect(board.toPBN())
        .toBe('W:...J ...Q ...K ...');

    board.undoPlay();

    expect(board.toPBN())
        .toBe('S:...A ...J ...Q ...K');

    board.undoPlay();

    expect(board.toPBN())
        .toBe('S:5...A ...J ...Q ...K');

    board.undoPlay();

    expect(board.toPBN())
        .toBe('E:4...K 5...A ...J ...Q');
});
