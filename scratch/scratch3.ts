import { generateExercise } from "../modules/generator.ts";
// @ts-ignore
import * as wasmModule from '../out.js';

import Wasm from "../modules/Wasm.ts";

const ex = generateExercise(new Wasm(wasmModule));

// console.log(ex);