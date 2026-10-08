const urlsWasm = import.meta.glob<string>("../../build/*.wasm", {
  query: "?url",
  import: "default",
  eager: true
});

const imports: WebAssembly.Imports = {
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

export type VersaoWasm = "release" | "debug";

export async function carregarWasm(versao: VersaoWasm = "release") {
  const possuiSuporteWasm = typeof WebAssembly === "object";
  if (!possuiSuporteWasm) {
    throw new Error("O navegador não possui suporte a WebAssembly");
  }

  const wasmUrl = getUrl(versao);
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


function getUrl(versao : VersaoWasm) {
  const url = urlsWasm[`../../build/${versao}.wasm`];
  if (!url) {
      throw new Error(`WASM "${versao}" não encontrado em build/. Compile essa versão antes.`);
    }
    return url;
}
