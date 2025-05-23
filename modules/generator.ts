import { Player, RANKS, Suit } from "./constants.ts";
import Deal from "./Deal.ts";
import Card from "./Card.ts";
import Board from "./Board.ts";
import Exercise from "./Exercise.ts";
import Wasm from "./Wasm.ts";
import NextPlayCalculator from "./NextPlayCalculator.ts";

const suits = ['C', 'D', 'H', 'S'];
const hcpMap: any = { 'A': 4, 'K': 3, 'Q': 2, 'J': 1 };

function getDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let rank of RANKS) {
            deck.push(rank + suit);
        }
    }

    function shuffle(array: string[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffle(deck);

    return deck;
}

function generateBridgeHand(targetHCP: number, deck: string[]): string[] {
    // Separate HCP and non-HCP cards
    function splitDeck(deck: string[]) {
        const hcpCards: string[] = [];
        const nonHCP = [];
        for (let card of deck) {
            const rank = card.slice(0, -1);
            if (hcpMap[rank]) {
                hcpCards.push(card);
            } else {
                nonHCP.push(card);
            }
        }
        return { hcpCards, nonHCP };
    }

    // Backtracking approach to find a combination matching the target HCP
    function findHCPCombination(
            cards: string[], target: number, index = 0, current: string[] = [], currentHCP = 0) {

        if (currentHCP === target) return current; // Exact match
        if (currentHCP > target || index >= cards.length) return null; // Exceeded or no cards left

        const card = cards[index];
        const rank = card.slice(0, -1);
        const hcp = hcpMap[rank] || 0;

        // Include this card in the hand
        const withCard: string[] =
            findHCPCombination(cards, target, index + 1, [...current, card], currentHCP + hcp);

        if (withCard) return withCard;

        // Skip this card
        return findHCPCombination(cards, target, index + 1, current, currentHCP);
    }

    // Main hand generation
    const { hcpCards, nonHCP } = splitDeck(deck);

    // Find the exact HCP combination
    const selectedHCP = findHCPCombination(hcpCards, targetHCP);

    if (!selectedHCP) {
        throw new Error(`Cannot generate a hand with exactly ${targetHCP} HCP.`);
    }

    const randomCards = nonHCP.slice(0, 13 - selectedHCP.length);

    // Combine selected HCP cards with random cards
    return selectedHCP.concat(randomCards);
}

export function generateDeal(nPoints: number, sPoints: number): Deal {

    let deck = getDeck();

    const nCards = generateBridgeHand(nPoints, deck);

    deck = deck.filter(card => !nCards.includes(card));

    const sCards = generateBridgeHand(sPoints, deck);

    deck = deck.filter(card => !sCards.includes(card));

    const eCards = deck.slice(0, 13);

    const wCards = deck.slice(13, 26);

    const deal = new Deal(Player.West);

    deal.addCards(Player.North, nCards.map(c => Card.parse(c)));
    deal.addCards(Player.East, eCards.map(c => Card.parse(c)));
    deal.addCards(Player.South, sCards.map(c => Card.parse(c)));
    deal.addCards(Player.West, wCards.map(c => Card.parse(c)));

    return deal;
}

export function createBoard(pbn: string, wasm: Wasm): Board {
    const strain = wasm.calcDDTable(pbn).getBestStrain();

    return new Board(pbn, strain);
}

export function generateBoard(wasm: Wasm): Board {
    const deal = generateDeal(5, 19);
    const pbn = deal.toPBN(deal.opener);

    // const pbn = 'W:AJT83.63.J873.86 2.J98.KT62.QJ943 74.542.AQ95.KT75 KQ965.AKQT7.4.A2';
    // const deal = Dea
    // l.fromPBN(pbn);

    const strain = wasm.calcDDTable(pbn).getBestStrain();

    const playerCards = deal.getPlayerCards(Player.North);
    if (playerCards.filter(c => c.suit === strain).length > 3) {
        return generateBoard(wasm);
    } else if (strain === 'N' && Math.random() * 10 < 7) {
        return generateBoard(wasm);
    }

    return new Board(pbn, strain);
}

export function generateExercise(wasm: Wasm): Exercise {

    const originalBoard = generateBoard(wasm);


    const board = new Board(originalBoard.getTrickStartPbn(), originalBoard.strain);
    let first = true;
    while (!board.isCompleted()) {
        const playsResult = wasm.nextPlays(
            board.getTrickStartPbn(), board.strain, board.plays.map(p => p.card));

        const calc = new NextPlayCalculator(playsResult, board.deal, board.strain);

        let card = calc.getNextPlay();

        // if (first) {
        //     console.log(card);
        //     first = false;
        //     card = new Card('6', 'C');
        // }

        board.play(playsResult.player, card);
    }

    return new Exercise(originalBoard.deal,
                        originalBoard.strain, board.getNsTrickCount(), board.tricks);
}