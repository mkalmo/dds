import DDTableResult from "./DDTableResult.ts";
import Card from "./Card.ts";
import NextPlaysResult from "./NextPlaysResult.ts";

export default class Wasm {

    private readonly solveBoardWasm: any;
    private readonly calcDDTableWasm: any;
    private readonly mallocWasm: any;
    private readonly setValueWasm: any;

    constructor(public module: any) {

        this.solveBoardWasm = module.cwrap('solve',
            'string',
            ['string', 'string', 'number', 'number']);

        this.calcDDTableWasm = module.cwrap('generateDDTable', 'string', ['string']);

        this.mallocWasm = module._malloc;

        this.setValueWasm = module.setValue;
    }

    calcDDTable(pbn: string): DDTableResult {
        const raw = JSON.parse(this.calcDDTableWasm(pbn));

        return DDTableResult.fromRaw(raw);
    }

    nextPlays(pbn: string, strain: string, plays: Card[]): NextPlaysResult {
        const playsPtr = this.packPlays(plays);

        const result = JSON.parse(this.solveBoardWasm(pbn, strain, plays.length, playsPtr));

        if (result['error']) {
            throw Error('nextPlays(): ' + result['message']);
        }

        return NextPlaysResult.fromRaw(result);
    }

    private packPlays(plays: Card[]) {
        const suits = new Map<string, number>([['S', 0], ['H', 1], ['D', 2], ['C', 3]]);
        const ranks = new Map<string, number>([
            ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6],
            ['7', 7], ['8', 8], ['9', 9], ['T', 10], ['J', 11],
            ['Q', 12], ['K', 13], ['A', 14]
        ]);

        const buf = this.mallocWasm(8 * plays.length);
        for (let i = 0; i < plays.length; i++) {
            const card: Card = plays[i];
            const suit = suits.get(card.suit);
            const rank = ranks.get(card.rank);

            this.setValueWasm(buf + i * 8, suit, 'i32');
            this.setValueWasm(buf + i * 8 + 4, rank, 'i32');
        }

        return buf;
    }
}