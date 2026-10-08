# benchmark-ts-vs-as
Treinamento de codificação AssemblyScript com um teste comparando com o TypeScript

## Como rodar localmente
1. **Requisitos:** Node 24.18.0
2. **Instalação:** Rode o comando `npm ci`.
3. **Versão de Desenvolvimento:** Rode o comando `npm run dev`.
4. **Versão de Produção Local:** Rode o comando `npm run build && npm run preview`.
5. **Aviso:** Os resultados do benchmark só são válidos com o wasm em release (versão de produção). Veja mais na seção de [Metodologia](#metodologia-de-medição).
6. **Observação:** O aplicativo abre sob o caminho `/benchmark-ts-vs-as/`.

## Decisões de configuração

### Isolamento de tipos do WebWorker
O app (DOM) e o runner (WebWorker) usam libs diferentes, então utilizam `tsconfig.json` separados: o primeiro na raiz e o segundo em `src/runner/tsconfig.json`.

- Foi criado um `tsconfig.json` dedicado dentro de `src/runner/` estendendo a raiz com `"lib": ["ES2023", "WebWorker"]`.
- A pasta `src/runner` foi excluída do `tsconfig.json` principal.

**Decisão escolhida: rodar os dois via `npm run typecheck`, sem usar references.**

### Ambiente
**A versão do Node foi fixada em `24.18.0`**

- **Gerenciador de pacotes:** npm. Não misture com outro gerenciador de pacote para não criar um segundo arquivo de lock.
- **`.npmrc`:** engine-strict=true -> Verifica se a versão do node está de acordo com a versão definida na engine (v24.18.0)

### AssemblyScript (`asconfig.json`)

Decidimos manter o `optimizeLevel: 3`, `shrinkLevel: 0` e `noAssert: true` no target release para aproveitar o máximo a otimização. Em caso de ambientes em produção, deve-se avaliar o trade-off (menor tamanho/velocidade maior vs ausência de checks de segurança).

- **Runtime:** incremental. Como não definimos nenhum no `asconfig.json`, vale o padrão do compilador. Ele influencia os cenários com muita alocação. O runtime **não é exportado** porque, por enquanto, só lemos dados do WASM (nada é escrito pelo JS).
- **Loader manual, sem bindings gerados:** o `.wasm` é importado com `?url` e instanciado manualmente em `src/wasm/loader.ts`. Motivos: controle sobre instanciação e memória; a cola gerada copia dados a cada chamada, o que distorce a medição; ela também usa módulos do Node que não existem no navegador. Contraponto: para cenários só numéricos, a cola seria aceitável.

### Servidor e empacotamento Vite

- **Importação do WASM:** O arquivo `.wasm` gerado em `build/` é importado como uma URL de asset (usando o sufixo `?url`). Isso evita duplicação de arquivos na pasta `public/` e permite que o Vite inclua o binário diretamente no grafo de dependências da aplicação.
- **Caminho base (`base`):** O caminho base foi definido como `"/benchmark-ts-vs-as/"` no `vite.config.js` para garantir que o roteamento de assets funcione corretamente na publicação via GitHub Pages.
- **Isolamento de Origem Cruzada (COOP / COEP):** O servidor de desenvolvimento do Vite foi configurado com os cabeçalhos `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` para permitir timers de alta precisão (`performance.now()`). Para manter o mesmo suporte em produção no GitHub Pages (que não aceita cabeçalhos HTTP personalizados), adotamos a biblioteca `coi-serviceworker`.

## Publicação (GitHub Pages)

- URL: https://gnegraoleal.github.io/benchmark-ts-vs-as/
- Deploy automático via GitHub Actions a cada push na `main` (`.github/workflows/deploy.yml`).
- **Primeiro acesso:** a página recarrega uma vez, por causa do `coi-serviceworker` (necessário para o isolamento de origem cruzada, já que o GitHub Pages não aceita cabeçalhos customizados).
- Com o isolamento ligado, recursos de outras origens (fontes, scripts externos) são bloqueados. Por isso a UI não depende deles.

## Metodologia de medição

- Benchmarks só valem com o WASM em **release** (`optimizeLevel: 3`, sem asserts).
- O build de debug serve apenas para validar corretude.
