import { generateDeal } from '../modules/generator.ts';

// const h = new Hand(['AS', 'JS', 'JH', 'JC', 'QD', 'JD']);
// const s = h.getCardsOfSuit('D');
// console.log(s);

// const deal = generateDeal(9, 19);
// console.log(deal);


const exercises = Array.from({ length: 2 }).map((_, i) => {
    console.log('ex:', i);
    return i;
});

console.log(exercises);