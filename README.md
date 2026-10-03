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
