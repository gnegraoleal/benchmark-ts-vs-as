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
