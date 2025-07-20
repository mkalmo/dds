import {generateBoard, createExercise} from "../modules/generator.ts";
// @ts-ignore
import * as wasmModule from '../out.js';

import Wasm from "../modules/Wasm.ts";

const wasm = new Wasm(wasmModule);

const ex = createExercise(generateBoard(wasm), wasm);

console.log(ex);