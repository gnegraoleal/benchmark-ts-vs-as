import { add as wasmAdd } from "../../build/release.js";

const possuiSuporteWasm = typeof WebAssembly === "object";

export function add(a: number, b: number): number {
  if (!possuiSuporteWasm) {
    throw new Error("O navegador não possui suport a WebAssembly");
  }
  return wasmAdd(a, b);
}
