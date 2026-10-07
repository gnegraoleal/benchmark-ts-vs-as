import { carregarWasm } from "../wasm/loader.ts";

self.onmessage = async function(event){
  console.log(event.data);

  const wasm = await carregarWasm();
  self.postMessage(wasm.saudacoes());
}
