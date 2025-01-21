import { expect, test } from '@jest/globals';
import Card from "../modules/Card.ts";
import Wasm from "../modules/Wasm.ts";
// @ts-ignore
import * as wasmModule from '../out.js';
import { Suit } from "../modules/constants.ts";

test('Returns correct plays', () => {

    const pbn = 'W:239... J...2J Q...3Q A...4A';

    const result = new Wasm(wasmModule).nextPlays(pbn, Suit.Spades, []);

    const ranks = result.getCorrectPlays().map(card => card.rank);

    expect(ranks).toStrictEqual(['2', '3', '9']);
});
