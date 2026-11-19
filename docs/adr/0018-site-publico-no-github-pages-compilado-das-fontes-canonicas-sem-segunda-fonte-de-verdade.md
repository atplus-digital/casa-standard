---
status: accepted
date: 2026-11-18
builds-on: [ADR-0004, ADR-0007, ADR-0010, ADR-0014]
superseded-by: null
deciders: [maicon]
---

# Site público no GitHub Pages compilado das fontes canônicas sem segunda fonte de verdade

## Contexto e problema

Quem avalia ou consulta o CASA Standard precisa hoje navegar arquivos Markdown soltos no
repositório (`README.md`, `STANDARD.md`, `CHANGELOG.md`, `docs/adr/`, `docs/specs/` e
`docs/templates/skills/`). Falta um ponto público único, legível como especificação técnica e
com busca, quickstart copiável e navegação visual pelo grafo causal de decisões e contratos.

Ao mesmo tempo, publicar um site neste repositório esbarra em duas restrições centrais do
próprio método:

1. **Princípio 2 (um fato mora num arquivo só):** manter páginas HTML ou Markdown paralelas
   com o texto do padrão, das skills ou do changelog criaria uma segunda fonte da verdade,
   fadada a divergir a cada PR.
2. **Zero dependências externas e isolamento da toolchain:** toda a automação de referência do
   `casa-standard` roda apenas com a stdlib do Python 3; introduzir Node/npm, lockfiles ou
   pacotes pip para um gerador de site poluiria a árvore e não deve vazar para os adotantes
   via `casa-init`.

## Direcionadores da decisão

- **Fonte única real:** o site compila diretamente `STANDARD.md`, `CHANGELOG.md`,
  `docs/index.json`, `docs/adr/*.md`, `docs/specs/*.md` e `docs/templates/skills/*/SKILL.md`;
  a saída `_site/` é artefato efêmero de build, ignorado pelo git.
- **Zero dependências externas:** compilador em Python 3 stdlib + HTML semântico, CSS puro e
  JS vanilla, determinístico e testável localmente e no CI.
- **Escopo restrito ao repo de referência:** `scripts/build-site` e `site/` não entram em
  `TOOLCHAIN` do `casa-init`, não alteram `docs-check` e não mudam o contrato dos adotantes
  (`casa-version` permanece `1.10`, ADR-0010).
- **Portabilidade de URL:** links internos e assets relativos ao nível da página, funcionando
  tanto sob subpath de projeto no GitHub Pages (`/casa-standard/`) quanto em domínio próprio
  ou servidor local.
- **Sistema visual e estados explícitos (ADR-0014):** direção editorial técnica com tokens HSL
  em CSS custom properties (tema claro em papel quente e escuro em carvão neutro, respeitando
  preferência do sistema com alternador persistido; tipografia `Newsreader`,
  `Plus Jakarta Sans` e `JetBrains Mono`) e estados obrigatórios de UI (empty-state em busca e
  filtros com ação de limpeza, confirmação de cópia e navegação responsiva).

## Opções consideradas

### Opção 1 — Páginas HTML/Markdown escritas à mão e versionadas em `docs/` ou `site/`
**Prós:** zero script de build.
**Contras:** viola frontalmente o Princípio 2; qualquer mudança em `STANDARD.md`, num ADR ou
numa skill exige atualizar o site na mão.

### Opção 2 — Framework gerador externo (Astro, VitePress, MkDocs, Docusaurus)
**Prós:** ecossistema pronto de temas e busca.
**Contras:** introduz `package.json`/lockfile ou ambiente pip num repo cuja premissa é rodar
apenas com Python 3 stdlib; aumenta superfície de manutenção e tempo de CI sem necessidade.

### Opção 3 — SPA que busca os `.md` crus via `fetch` no navegador
**Prós:** sem passo de compilação HTML.
**Contras:** HTML vazio sem JavaScript, ruim para indexação/SEO, flash de carregamento e
fragilidade de caminhos entre GitHub Pages e visualização local.

### Opção 4 — `scripts/build-site` (Python 3 stdlib) + assets vanilla (`site/`) publicados via `actions/deploy-pages`
**Prós:** HTML estático pré-renderizado a partir das fontes canônicas; zero dependências
externas; determinístico e verificável por suíte própria (`scripts/test-site`) no DoD global;
publicação oficial via artefato do GitHub Actions sem branch `gh-pages` poluindo o histórico.
**Contras:** exige manter um conversor enxuto do subconjunto de Markdown usado pelo repo
(títulos, listas, tabelas GFM, citações, blocos de código e ênfases).

## Decisão

Opção 4. O repositório ganha `scripts/build-site` (Python 3 stdlib) e os assets estáticos de
apresentação em `site/` (`style.css`, `app.js`, `favicon.svg`). A cada push em `main`, o
workflow `.github/workflows/pages.yml` compila `_site/` e publica no GitHub Pages via
`actions/upload-pages-artifact` e `actions/deploy-pages`, sem branch de artefatos.

`scripts/test-site` entra no DoD global do `AGENTS.md` e no `.github/workflows/docs-check.yml`,
garantindo que mudanças futuras em `STANDARD.md`, ADRs, Specs ou skills nunca quebrem a
compilação nem os links internos do site. Nada muda no `casa-init`, no `docs-check` ou na
versão de contrato (`CASA 1.10`).

## Consequências

- O site público do CASA Standard reflete automaticamente cada ADR, Spec, skill e versão de
  contrato mergeada em `main`, sem texto normativo duplicado.
- Qualquer regressão estrutural na geração ou em links internos falha no gate de PR antes de
  chegar ao deploy do GitHub Pages.
- O conversor Markdown cobre o vocabulário usado nos documentos deste repositório; sintaxe
  nova fora dele pede extensão explícita em `scripts/build-site` + caso em `scripts/test-site`.

## Confirmação

```bash
scripts/test-site            # exit 0: geração determinística, links íntegros, SEO e isolamento do casa-init
python3 scripts/docs-check   # exit 0: o próprio repo segue verde com _site/ ignorado
```

## Notas

Gatilho: issue #37. Comportamento e casos de borda detalhados em SPEC-0011.
