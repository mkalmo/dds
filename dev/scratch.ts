// @ts-ignore
import generateHands from './generator.ts';

// @ts-ignore
import Hand from '../comp/Hand.ts';
// const h = new Hand(['AS', 'JS', 'JH', 'JC', 'QD', 'JD']);
// const s = h.getCardsOfSuit('D');
// console.log(s);

const hands = generateHands(9, 19);
console.log(hands[3]);
