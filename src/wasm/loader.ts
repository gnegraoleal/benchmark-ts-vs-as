import wasmUrl from "../../build/release.wasm?url";

const imports:  WebAssembly.Imports = {
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
    throw new Error("O navegador não possui suporte a WebAssembly");
  }
  const wasmPromise = WebAssembly.instantiateStreaming(fetch(wasmUrl), imports);

  const { instance } = await wasmPromise;
  return instance.exports as unknown as Exports;
}

export function lerString(buffer: ArrayBuffer, pointer: number) {
  const view = new DataView(buffer);
  const tamanho = view.getUint32(pointer - 4, true);
  const byteView = new Uint8Array(buffer, pointer, tamanho);
  const textDecoder = new TextDecoder("utf-16le");
  return textDecoder.decode(byteView);
}
