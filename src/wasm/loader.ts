const urlsWasm = import.meta.glob<string>("../../build/*.wasm", {
  query: "?url",
  import: "default",
  eager: true
});

let instanciaAtiva: WebAssembly.Instance | null = null;

const imports: WebAssembly.Imports = {
  env: {
    abort(messagePtr: number, fileNamePtr: number, linha: number, coluna: number) {
      if (!instanciaAtiva) {
        throw new Error("O abort foi chamado antes de existir uma instância ativa!");
      }
      const memory = instanciaAtiva.exports.memory as WebAssembly.Memory;

      const mensagem = messagePtr ? lerString(memory.buffer, messagePtr) : "Abort sem mensagem de erro!";
      const fileName = fileNamePtr ? lerString(memory.buffer, fileNamePtr) : "-";

      const error = `Erro no arquivo ${fileName} linha ${linha} e coluna ${coluna}: ${mensagem}`;
      console.error(error);
      throw new Error(error);
    },
  },
};

interface Exports{
  memory: WebAssembly.Memory,
  saudacoes(): number,
  testAbort(): void
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
  instanciaAtiva = instance;
  return instance?.exports as unknown as Exports;
}

export function lerString(buffer: ArrayBuffer, pointer: number) {
  if (pointer == 0) return "";
  const view = new DataView(buffer);
  const tamanho = view.getUint32(pointer - 4, true);
  const tamanhoBytes = tamanho * 2;
  const byteView = new Uint8Array(buffer, pointer, tamanhoBytes);
  const textDecoder = new TextDecoder("utf-16le");
  return textDecoder.decode(byteView);
}


function getUrl(versao : VersaoWasm) : string{
  const url = urlsWasm[`../../build/${versao}.wasm`];
  if (!url) {
      throw new Error(`WASM "${versao}" não encontrado em build/. Compile essa versão antes.`);
    }
    return url;
}
