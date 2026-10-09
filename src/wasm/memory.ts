const TAMANHO_CAMPO_BYTES = 4;
const CODIFICACAO_STRING = "utf-16le";

/**
 * Lê uma string do AssemblyScript a partir da memória do WASM.
 *
 * Layout na memória:
 *
 *   endereço:   pointer - 4          pointer
 *               ┌──────────────────┬────────────────────────────┐
 *               │ tamanho (u32 LE) │ texto em UTF-16 LE         │
 *               └──────────────────┴────────────────────────────┘
 *                   4 bytes            `tamanho` bytes (2 por caractere)
 *
 * - O `pointer` aponta para o INÍCIO DO TEXTO, não para o campo de tamanho.
 * - O tamanho já está em BYTES, não em caracteres (não multiplicar por 2).
 *
 * Sobre o buffer: a função recebe a `Memory` e lê `memory.buffer` por dentro.
 * Isso evita usar um buffer invalidado: quando o WASM cresce a memória,
 * o buffer antigo fica "detached" (byteLength 0), enquanto o objeto `Memory`
 * continua válido. Quem criar visões próprias (DataView, Uint8Array) em outro
 * lugar deve recriá-las a partir de `memory.buffer` depois de qualquer chamada ao WASM.
 *
 * Cada instância tem a sua própria `Memory`: use a da instância que devolveu
 * o ponteiro. Ponteiro de uma instância lido na memória de outra resulta em
 * texto errado, sem erro.
 *
 * Fonte do formato: https://www.assemblyscript.org/runtime.html
 *
 * @param memory  memória da instância WASM que devolveu o ponteiro
 * @param pointer endereço do início do texto (diferente de 0)
 * @returns       a string decodificada
 * @throws        Error se o ponteiro for 0 (null)
 */

export function lerString(memory: WebAssembly.Memory, pointer: number) : string{
  if (pointer == 0) throw new Error("Erro: O ponteiro de referência é igual a zero (null pointer)!");
  const view = new DataView(memory.buffer);
  const tamanhoBytes = view.getUint32(pointer - TAMANHO_CAMPO_BYTES, true);
  const byteView = new Uint8Array(memory.buffer, pointer, tamanhoBytes);
  const textDecoder = new TextDecoder(CODIFICACAO_STRING);
  return textDecoder.decode(byteView);
}
