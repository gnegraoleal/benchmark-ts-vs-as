# benchmark-ts-vs-as
Treinamento de codificação AssemblyScript com um teste comparando com o TypeScript

## Decisões de configuração

### Isolamento de tipos do WebWorker
O app (DOM) e o runner (WebWorker) usam libs diferentes, então utilizam `tsconfig.json` separados: o primeiro na raiz e o segundo em `src/runner/tsconfig.json`.

- Foi criado um `tsconfig.json` dedicado dentro de `src/runner/` estendendo a raiz com `"lib": ["ES2023", "WebWorker"]`.
- A pasta `src/runner` foi excluída do `tsconfig.json` principal.

**Decisão escolhida: rodar os dois via `npm run typecheck`, sem usar references.**

### Ambiente
**A versão do Node foi fixada em `24.18.0`**

### AssemblyScript (`asconfig.json`)

Decidimos para manter o `optimizeLevel: 3`, `shrinkLevel: 0` e `noAssert: true` no target release para aproveitar o máximo a otimização. Em caso de ambientes em produção, deve-se avaliar o trade-off (menor tamanho/velocidade maior vs ausência de checks de segurança).

### Servidor e empacotamento Vite

- **Importação do WASM:** O arquivo `.wasm` gerado em `build/` é importado como uma URL de asset (usando o sufixo `?url`). Isso evita duplicação de arquivos na pasta `public/` e permite que o Vite inclua o binário diretamente no grafo de dependências da aplicação.
- **Caminho base (`base`):** O caminho base foi definido como `"/benchmark-ts-vs-as/"` no `vite.config.ts` para garantir que o roteamento de assets funcione corretamente na publicação via GitHub Pages.
- **Isolamento de Origem Cruzada (COOP / COEP):** O servidor de desenvolvimento do Vite foi configurado com os cabeçalhos `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` para permitir timers de alta precisão (`performance.now()`). Para manter o mesmo suporte em produção no GitHub Pages (que não aceita cabeçalhos HTTP personalizados), adotamos a biblioteca `coi-serviceworker`.
