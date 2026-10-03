self.onmessage = async (event) => {
  console.log(event.data);
  const { saudacoes } = await import('../../build/release.js');
  self.postMessage(saudacoes());
}
