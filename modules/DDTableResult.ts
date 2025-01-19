import { Strain, Strains } from "./constants.ts";

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
    strain: Strain,
    nsScore: number,
    ewScore: number
}

export default class DDTableResult {

    static fromRaw(raw: any) {
        const strainToPlayerScore = raw as StrainToPlayerScore;
        const scores: StrainScoreEntry[] = [];
        for (const strain of Strains) {
            const playerScores: PlayerScore  = strainToPlayerScore[strain];
            scores.push(
                { strain, nsScore: playerScores.N, ewScore: playerScores.E });

        }

        return new DDTableResult(scores);
    }

    constructor(private readonly scores: StrainScoreEntry[]) {}

    getBestStrain(): Strain {
        let best = this.scores[0];
        for (const current of this.scores) {
            if (current.nsScore > best.nsScore) {
                best = current;
            }
        }
        return best.strain;
    }
}
