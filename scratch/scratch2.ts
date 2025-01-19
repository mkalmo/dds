import { Suit } from "../modules/constants.ts";
import Deal from "../modules/Deal.ts";
import Wasm from "../modules/Wasm.ts";
// @ts-ignore
import * as wasmModule from '../out.js';
import NextPlayCalculator from "../modules/NextPlayCalculator.ts";

// const pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4';
// const pbn = 'S:AQ.2.. 94.4.. 67.A.. KJ.3..';
const pbn = 'S:AKQ86.J..Q863 943.K74.64.KJ JT52..K.AT975 7.T9862.98.42';

const deal = Deal.fromPBN(pbn);
console.log(deal.opener);

const result = new Wasm(wasmModule).nextPlays(pbn, Suit.Spades, []);

console.log(result.getCorrectPlays());

const calc = new NextPlayCalculator(result, deal, Suit.Spades);

console.log(calc.getNextPlay());
