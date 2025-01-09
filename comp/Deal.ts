import Hand from "./Hand.ts";
import { NEXT_PLAYER, Player, Players, Suit, Suits, SUITS } from "../constants.ts";
import Card from "./Card.ts";

export default class Deal {

    private readonly playersToCards = new Map<Player, Card[]>();

    constructor(hands: Hand[]) {
        for (const player of Players) {
            this.playersToCards.set(player, []);
        }
    }

    addCard(player: Player, card: Card): void {
        this.playersToCards.get(player).push(card);
    }

    removeCard(player: Player, card: Card): void {
        const playerCards = this.playersToCards.get(player);
        const updatedCards = playerCards.filter(c => c.toString() !== card.toString());

        if (updatedCards.length !== playerCards.length -1) {
            throw Error('Player ' + player + ' does not have card ' + card);
        }

        this.playersToCards.set(player, updatedCards);
    }

    cardCount(): number {
        let sum = 0;
        for (const player of Players) {
            sum += this.playersToCards.get(player).length;
        }
        return sum;
    }

    toString(): string {
        let result = '';
        for (const player of Players) {
            result += player + ': ' + this.playersToCards.get(player).join(', ') + '\n';
        }
        return result;
    }

    toPBN(player: Player) {

        const holdings: string[] = [];

        let runnerPlayer = player;
        for (let i = 0; i < 4; i++) { // 4 players

            const playerCards = Suits.map(
                suit => this.getCardsBySuit(runnerPlayer, suit)
                    .map(c => c.rank).join(''))

            holdings.push(playerCards.join('.'))

            runnerPlayer = Player.fromString(NEXT_PLAYER.get(runnerPlayer));
        }

        return player + ':' + holdings.join(' ');
    }

    private getCardsBySuit(player: Player, suit: string) {
        return this.playersToCards.get(player)
            .filter(card => card.suit === suit);
    }

    static fromPBN(pbn: string): Deal {
        const textHands = Deal.parsePBNStrings(pbn);

        const deal = new Deal([]);
        for (const [playerStr, holdingText] of textHands.entries()) {
            const player = Player.fromString(playerStr);
            const holdings = holdingText.split('.');
            holdings.forEach((holding, index) => {
                const suit = SUITS[index];
                holding.split('').forEach(rank => deal.addCard(player, new Card(rank, suit)));
            })
        }

        return deal;
    }

    private static parsePBNStrings(pbn: string): Map<string, string> {
        const parts = pbn.split(' ');
        if (parts.length !== 4) {
            throw 'PBN must have four hands (got ' + parts.length + ')';
        }

        const m = parts[0].match(/^([NSEW]):/);
        if (!m) {
            throw 'PBN must start with either "N:", "S:", "E:" or "W:"';
        }
        parts[0] = parts[0].slice(2);
        let player: string = m[1];
        const hands = new Map<string, string>();
        parts.forEach(txt => {
            hands.set(player, txt);
            player = NEXT_PLAYER.get(player);
        });
        return hands;
    }

    textToRank(txt: string) {
        if (txt.length !== 1) {
            throw 'Invalid card symbol: ' + txt;
        }
        if (txt >= '2' && txt <= '9') return Number(txt);
        if (txt === 'T') return 10;
        if (txt === 'J') return 11;
        if (txt === 'Q') return 12;
        if (txt === 'K') return 13;
        if (txt === 'A') return 14;
        throw 'Invalid card symbol: ' + txt;
    }
}