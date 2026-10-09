import { lerString } from "./memory";

const urlsWasm = import.meta.glob<string>("../../build/*.wasm", {
  query: "?url",
  import: "default",
  eager: true
});

function criarImports(obterInstancia: () => WebAssembly.Instance | null): WebAssembly.Imports{
  return {
    env: {
      abort(messagePtr: number, fileNamePtr: number, linha: number, coluna: number) {
        const instancia = obterInstancia();
        if (!instancia) {
          throw new Error("O abort foi chamado antes de existir uma instância ativa!");
        }
        const memory = instancia.exports.memory as WebAssembly.Memory;

        const mensagem = messagePtr ? lerString(memory, messagePtr) : "Abort sem mensagem de erro!";
        const fileName = fileNamePtr ? lerString(memory, fileNamePtr) : "-";

        const error = `Erro no arquivo ${fileName} linha ${linha} e coluna ${coluna}: ${mensagem}`;
        throw new Error(error);
      },
    },
  }
}


const versoesCache = new Map<VersaoWasm, Promise<Exports>>();

export interface Exports{
  memory: WebAssembly.Memory,
  saudacoes(): number,
  testeAbort(): void
}

export type VersaoWasm = "release" | "debug";

export async function carregarWasm(versao: VersaoWasm = "release"): Promise<Exports> {
  const possuiSuporteWasm = typeof WebAssembly === "object";
  if (!possuiSuporteWasm) {
    throw new Error("O navegador não possui suporte a WebAssembly");
  }

  const versaoEmCache = versoesCache.get(versao);
  if (versaoEmCache) return versaoEmCache;

  const promise = getPromise(versao);
  versoesCache.set(versao, promise);
  promise.catch(() => versoesCache.delete(versao));
  return promise;
}

function getUrl(versao : VersaoWasm) : string{
  const url = urlsWasm[`../../build/${versao}.wasm`];
  if (!url) {
    throw new Error(`WASM "${versao}" não encontrado em build/. Compile essa versão antes.`);
  }
  return url;
}

async function getPromise(versao: VersaoWasm): Promise<Exports>{
  const wasmUrl = getUrl(versao);
  let instancia: WebAssembly.Instance | null = null;
  const imports = criarImports(() => instancia);
  const response = await fetch(wasmUrl);

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao carregar o WASM versão ${versao}`);
  }
  try {
    try{
      const wasmPromise = WebAssembly.instantiateStreaming(response.clone(), imports);
      const { instance } = await wasmPromise;
      instancia = instance;
    } catch {
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, imports);
      instancia = instance;
    }
  } catch (erro) {
    throw new Error(`Erro ao instanciar o WASM ${versao}`, { cause: erro })
  }

  return instancia.exports as unknown as Exports;
}
