import { carregarWasm } from "../wasm/loader.ts";
import { lerString } from "../wasm/memory.ts";

self.onmessage = async function(event){
  console.log(event.data);

  const wasm = await carregarWasm();
  self.postMessage(lerString(wasm.memory ,wasm.saudacoes()));
}
