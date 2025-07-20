import { expect, test } from '@jest/globals';
import Deal from "../modules/Deal.ts";
import {Player} from "../modules/constants.ts";

test('Calculates HPC for player', () => {

    const pbn = 'W:AJT83.63.J873.86 2.J98.KT62.QJ943 74.542.AQ95.KT75 KQ965.AKQT7.4.A2';

    const deal = Deal.fromPBN(pbn);

    expect(deal.getHcp(Player.West)).toBe(6);
    expect(deal.getHcp(Player.North)).toBe(7);
    expect(deal.getHcp(Player.East)).toBe(9);
    expect(deal.getHcp(Player.South)).toBe(18);
});

