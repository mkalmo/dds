import { Strain, Strains } from "../modules/constants.ts";

export function formatStrain(suit: Strain): string {
    const index = Strains.indexOf(suit);
    return String.fromCharCode([78, 9824, 9829, 9830, 9827][index]);
}

