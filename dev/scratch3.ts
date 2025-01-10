import { generateExercise } from "./generator.ts";
// @ts-ignore
import * as wasmModule from '../out.js';

import Wasm from "../comp/Wasm.ts";

const ex = generateExercise(new Wasm(wasmModule));

console.log(ex);