import { NEXT_PLAYER, Player, Players, Suits, SUITS } from "./constants.ts";
import Card from "./Card.ts";
import Hand from "./Hand.ts";
import { Play } from "./types.ts";

export default class Deal {

    private readonly playersToCards = new Map<Player, Card[]>();

    constructor(public readonly opener: Player) {
        for (const player of Players) {
            this.playersToCards.set(player, []);
        }
    }

    addCard(player: Player, card: Card): void {
        this.playersToCards.get(player).push(card);
    }

    addCards(player: Player, cards: Card[]): void {
        this.sort(cards).forEach(c => this.playersToCards.get(player).push(c));
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
            const cards = this.sort(this.playersToCards.get(player));
            result += player + ': ' + cards.join(', ') + '\n';
        }
        return result;
    }

    private sort(cards: Card[]): Card[] {
        const copy = [...cards];
        copy.sort((a, b) => a.compareTo(b));
        return copy;
    }

    getPbn(): string {
        return this.toPBN(Player.West);
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

    public getPlayerCards(player: Player): Card[] {
        return this.playersToCards.get(player);
    }

    private getCardsBySuit(player: Player, suit: string) {
        return this.playersToCards.get(player)
            .filter(card => card.suit === suit);
    }

    static fromPBN(pbn: string): Deal {
        const opener = pbn.split(':')[0];

        const textHands = Deal.parsePBNStrings(pbn);

        const deal = new Deal(Player.fromString(opener));
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

    private static parsePBNStrings(pbn: string): Map<Player, string> {
        const parts = pbn.split(' ');
        if (parts.length !== 4) {
            throw 'PBN must have four hands (got ' + parts.length + ')';
        }

        const m = parts[0].match(/^([NSEW]):/);
        if (!m) {
            throw 'PBN must start with either "N:", "S:", "E:" or "W:"';
        }
        parts[0] = parts[0].slice(2);
        let player: Player = Player.fromString(m[1]);
        const playerToHand = new Map<Player, string>();
        parts.forEach(txt => {
            playerToHand.set(player, txt);
            player = NEXT_PLAYER.get(player);
        });
        return playerToHand;
    }
}