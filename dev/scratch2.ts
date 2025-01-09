import _ from "underscore";
import { NEXT_PLAYER, Player, SUITS } from "../constants.ts";
import Deal from "../comp/Deal.ts";
import Trick from "../comp/Trick.ts";
import Card from "../comp/Card.ts";

// const pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4';
// const pbn = 'S:AQ.2.. 94.4.. 67.A.. KJ.3..';
const pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4';

const deal = Deal.fromPBN(pbn);
console.log(deal.opener());
// deal.removeCard(Player.West, Card.parse('AD'));
// console.log(deal.toPBN(Player.North));

//
// Card { rank: 'A', suit: 'D' }
// const result = Deal.fromPBN(pbn);
// console.log(result.toPBN(Player.South));

// const plays = [
//     { player: 'N', card: Card.parse('7S') },
//     { player: 'E', card: Card.parse('KS') },
//     { player: 'S', card: Card.parse('AS') },
//     { player: 'W', card: Card.parse('4S') }
// ];
// const trick2 = new Trick('S', plays);
//
// console.log(trick2.toString());
// console.log(trick2.winner());

// const deal = new Deal([]);
// deal.addCard(Player.North, 'KD');
// deal.addCard(Player.North, 'TD');
// console.log(deal.toString());

