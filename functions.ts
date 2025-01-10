// @ts-ignore
import * as Module from './out.js';

import { SUIT_RANKS1 } from './constants.ts';
import DDTableResult from "./comp/DDTableResult.ts";

const _solveBoard = Module.cwrap('solve',
    'string',
    ['string', 'string', 'number', 'number']);

const _calcDDTable = Module.cwrap('generateDDTable', 'string', ['string']);

export function calcDDTable(pbn: string): DDTableResult {
    const raw = JSON.parse(_calcDDTable(pbn));

    return DDTableResult.fromRaw(raw);
}

function packPlays(plays: string[]) {
    const suits = new Map<string, number>([['S', 0], ['H', 1], ['D', 2], ['C', 3]]);
    const ranks = new Map<string, number>([
        ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6],
        ['7', 7], ['8', 8], ['9', 9], ['T', 10], ['J', 11],
        ['Q', 12], ['K', 13], ['A', 14]
    ]);

    const buf = Module._malloc(8 * plays.length);
    for (let i = 0; i < plays.length; i++) {
        const p: string = plays[i];
        if (p.length !== 2) {
            throw 'Invalid play: ' + p;
        }
        const suit = suits.get(p[1]);
        const rank = ranks.get(p[0]);

        Module.setValue(buf + i * 8, suit, 'i32');
        Module.setValue(buf + i * 8 + 4, rank, 'i32');
    }

    return buf;
}

export function nextPlays(pbn: string, trump: string, plays: string[]) {
    const playsPtr = packPlays(plays);

    return JSON.parse(_solveBoard(pbn, trump, plays.length, playsPtr));
}

export function textToRank(txt: string) {
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

export function formatCard(card: any) {
    return rankToText(card.rank) + card.suit;
}

export function rankToText(rank: number) {
    if (rank < 10) return '' + rank;
    else if (rank === 10) return 'T';
    else if (rank === 11) return 'J';
    else if (rank === 12) return 'Q';
    else if (rank === 13) return 'K';
    else if (rank === 14) return 'A';
    throw 'Invalid card rank: ' + rank;
}

export function compareCards(a: any, b: any) {
    if (a.suit !== b.suit) {
        //return SUIT_RANKS[a.suit] - SUIT_RANKS[b.suit];

        return SUIT_RANKS1.get(a.suit) - SUIT_RANKS1.get(b.suit);

    } else {
        return a.rank - b.rank;
    }
}
