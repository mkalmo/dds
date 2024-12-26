// @ts-ignore
import Hand from "../comp/Hand.ts";

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const suits = ['C', 'D', 'H', 'S'];
const hcpMap: any = { 'A': 4, 'K': 3, 'Q': 2, 'J': 1 };

function getDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
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

function generateBridgeHand(targetHCP: number, deck: string[]) {
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

export default function generateHands(nPoints: number, sPoints: number): Hand[] {

    let deck = getDeck();

    const nHand = generateBridgeHand(nPoints, deck);

    deck = deck.filter(card => !nHand.includes(card));

    const sHand = generateBridgeHand(sPoints, deck);

    deck = deck.filter(card => !sHand.includes(card));

    const eHand = deck.slice(0, 13);

    const wHand = deck.slice(13, 26);

    return [nHand, eHand, sHand, wHand].map(e => new Hand(e));
}

