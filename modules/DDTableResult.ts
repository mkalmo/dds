
type PlayerScore =  {
    N: number;
    S: number;
    E: number;
    W: number;
}

type StrainToPlayerScore = {
    N: PlayerScore,
    S: PlayerScore,
    H: PlayerScore,
    D: PlayerScore,
    C: PlayerScore,
}

type StrainScoreEntry = {
    strain: string,
    nsScore: number,
    ewScore: number
}

export default class DDTableResult {

    static fromRaw(raw: any) {
        const strainToPlayerScore = raw as StrainToPlayerScore;
        const scores: StrainScoreEntry[] = [];
        for (const strain of ['N', 'S', 'H', 'D', 'C'] as const) {
            const playerScores: PlayerScore  = strainToPlayerScore[strain];
            scores.push(
                { strain, nsScore: playerScores.N, ewScore: playerScores.E });

        }

        return new DDTableResult(scores);
    }

    constructor(private readonly scores: StrainScoreEntry[]) {}

    getBestStrain() {
        let best = this.scores[0];
        for (const current of this.scores) {
            if (current.nsScore > best.nsScore) {
                best = current;
            }
        }
        return best.strain;
    }

}

// {
//     N: { N: 3, S: 3, E: 9, W: 9 },
//     S: { N: 5, S: 5, E: 8, W: 8 },
//     H: { N: 3, S: 3, E: 9, W: 9 },
//     D: { N: 6, S: 6, E: 7, W: 7 },
//     C: { N: 3, S: 3, E: 9, W: 9 }
// }