function generateBridgeHand(targetHCP) {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['C', 'D', 'H', 'S'];
    const hcpMap = { 'A': 4, 'K': 3, 'Q': 2, 'J': 1 };

    // Generate the full deck
    const deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push(rank + suit);
        }
    }

    // Helper: Shuffle array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Separate HCP and non-HCP cards
    function splitDeck(deck) {
        const hcpCards = [];
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
    function findHCPCombination(cards, target, index = 0, current = [], currentHCP = 0) {
        if (currentHCP === target) return current; // Exact match
        if (currentHCP > target || index >= cards.length) return null; // Exceeded or no cards left

        const card = cards[index];
        const rank = card.slice(0, -1);
        const hcp = hcpMap[rank] || 0;

        // Include this card in the hand
        const withCard = findHCPCombination(cards, target, index + 1, [...current, card], currentHCP + hcp);
        if (withCard) return withCard;

        // Skip this card
        return findHCPCombination(cards, target, index + 1, current, currentHCP);
    }

    // Main hand generation
    shuffle(deck);
    const { hcpCards, nonHCP } = splitDeck(deck);

    // Find the exact HCP combination
    const selectedHCP = findHCPCombination(hcpCards, targetHCP);

    if (!selectedHCP) {
        throw new Error(`Cannot generate a hand with exactly ${targetHCP} HCP.`);
    }

    // Shuffle and pick remaining cards
    shuffle(nonHCP);
    const randomCards = nonHCP.slice(0, 13 - selectedHCP.length);

    // Combine selected HCP cards with random cards
    return selectedHCP.concat(randomCards);
}

// Example: Generate a hand with 16 HCP
const hand = generateBridgeHand(10);
console.log("Hand:", hand);
