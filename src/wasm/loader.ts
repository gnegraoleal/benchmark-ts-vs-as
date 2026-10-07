import wasmUrl from "../../build/release.wasm?url";

const imports:  Object = {
  env: {
    abort() {
      throw new Error("abort chamado pelo WASM");
    },
  },
};

interface Exports{
  memory: WebAssembly.Memory,
  saudacoes(): number
}

export async function carregarWasm() {
  const possuiSuporteWasm = typeof WebAssembly === "object";
  if (!possuiSuporteWasm) {
    throw new Error("O navegador não possui suport a WebAssembly");
  }
  const wasmPromise = WebAssembly.instantiateStreaming(fetch(wasmUrl, imports));

  const { instance } = await wasmPromise;
  return instance.exports as unknown as Exports;
}
