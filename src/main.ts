import './style.css'

const worker = new Worker(new URL("./runner/worker.ts", import.meta.url), { type: "module" })
worker.postMessage("Olá do main!");
worker.onmessage = (event) => {
  console.log("Resposta do worker: " + event.data);
  document.querySelector('#app')!.innerHTML = `
    Mensagem do worker: ${event.data}
    `
}
