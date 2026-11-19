---
status: implemented
date: 2026-11-18
builds-on: [ADR-0018, ADR-0014, ADR-0010]
implemented-by:
  - scripts/build-site
  - scripts/test-site
  - site/style.css
  - site/app.js
  - site/favicon.svg
  - .github/workflows/pages.yml
  - .github/workflows/docs-check.yml
---

# build-site gera o site estático do CASA Standard para o GitHub Pages

## Objetivo

Publicar em `https://atplus-digital.github.io/casa-standard/` (e permitir inspeção local
idêntica) um site estático completo do CASA Standard — visão geral com quickstart copiável,
`STANDARD.md` navegável, explorador interativo do grafo de ADRs e Specs, catálogo das skills
`casa-*` e histórico do `CHANGELOG.md` — compilado diretamente das fontes canônicas do repo,
sem duplicar conteúdo e sem dependências externas (ADR-0018).

## Fluxo

1. Desenvolvedor ou CI executa `python3 scripts/build-site [--root .] [--out _site] [--base-url URL]`.
2. O script lê `STANDARD.md`, `CHANGELOG.md`, `docs/index.json`, `docs/adr/*.md`,
   `docs/specs/*.md` e `docs/templates/skills/*/SKILL.md`, calcula as arestas diretas e
   reversas do grafo (`builds-on`, `superseded-by`, `citado por`) e renderiza HTML semântico
   estático em `_site/`, copiando `site/{style.css,app.js,favicon.svg}` para `_site/assets/` e
   emitindo `_site/assets/search-index.json` mais `_site/.nojekyll`.
3. Em PR e push, `scripts/test-site` valida a geração no gate; em push na `main` (ou
   `workflow_dispatch`), `.github/workflows/pages.yml` publica `_site/` no GitHub Pages via
   `actions/deploy-pages`.

## Contrato

- **Entradas canônicas:** `STANDARD.md`, `CHANGELOG.md`, `docs/index.json`, `docs/adr/*.md`,
  `docs/specs/*.md`, `docs/templates/skills/*/SKILL.md` e assets de apresentação em `site/`.
- **Rotas geradas em `_site/`:**
  - `index.html` — apresentação editorial, os 4 pilares, anatomia interativa do repo, ciclo
    das 5 skills `casa-*`, quickstart com comandos copiáveis e métricas reais do repositório;
  - `standard/index.html` — `STANDARD.md` integral com sumário lateral fixo, âncoras estáveis
    por seção e referências `ADR-NNNN`/`SPEC-NNNN` clicáveis;
  - `grafo/index.html` — mapa causal SVG interativo + tabela filtrável por camada, status e
    busca textual;
  - `adr/<slug>/index.html` e `specs/<slug>/index.html` — página individual de cada documento
    de `docs/index.json`, com metadados derivados, links a montante (`builds-on`), links a
    jusante (`citado por`), `implemented-by` e destaque de `VERDADE ATUAL` em ADR superado;
  - `skills/index.html` — catálogo das Agent Skills `casa-*` com orçamento real de caracteres
    das descrições e corpo completo;
  - `changelog/index.html` — versões do contrato extraídas de `CHANGELOG.md`.
- **Links relativos:** todos os `href` e `src` internos usam caminhos relativos ao nível da
  página, operando sem quebra sob `/casa-standard/` no GitHub Pages ou na raiz local.
- **Isolamento:** `scripts/build-site`, `scripts/test-site` e `site/` nunca são copiados pelo
  `casa-init`; `_site/` fica no `.gitignore`.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | `scripts/build-site` executa sobre o repositório | gerar todas as rotas principais, uma página para cada item de `docs/index.json`, `assets/search-index.json` e `.nojekyll`, com exit 0 |
| 2 | a versão no cabeçalho de `STANDARD.md` ou o conjunto de docs em `docs/index.json` muda | refletir automaticamente a nova versão e a nova contagem/lista nas páginas geradas, sem valor hardcoded |
| 3 | uma página gerada referencia CSS, JS, favicon ou outra rota interna | resolver para um arquivo existente dentro de `_site/` por caminho relativo (sem `/assets/…` absoluto que quebre em subpath do GitHub Pages) |
| 4 | qualquer página HTML é emitida | conter exatamente um `<h1>`, `<title>`, `<meta name="description">` e `lang="pt-BR"` |
| 5 | prosa ou tabela cita `ADR-NNNN` ou `SPEC-NNNN` existente no grafo (fora de bloco de código) | converter a referência em link para a página gerada do documento correspondente |
| 6 | um ADR tem `status: superseded` ou é referenciado por outros docs via `builds-on` | exibir o aviso `VERDADE ATUAL` / `superseded-by` no topo e listar as conexões reversas (`citado por`) na página do documento |
| 7 | busca global (`⌘K`/`/`) ou filtro do grafo não encontra resultados | exibir empty-state explícito com botão de limpar busca/filtros que restaura a listagem (ADR-0014) |
| 8 | o usuário alterna o tema claro/escuro ou aciona copiar num bloco de código/quickstart | aplicar `data-theme` persistido sem recarregar a página e anunciar feedback visual no botão de cópia |
| 9 | `scripts/build-site` roda duas vezes sem mudança nas fontes | produzir árvore `_site/` byte a byte idêntica (determinismo) |
| 10 | `scripts/casa-init` roda sobre um repositório adotante | não copiar `scripts/build-site`, `scripts/test-site` nem `site/` para o destino |
| 11 | `scripts/build-site` gera `_site/` na raiz do `casa-standard` | `python3 scripts/docs-check` continuar saindo 0 com 0 erros e 0 avisos (`_site/` ignorado pelo `.gitignore`) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
scripts/test-site             # exit 0 — casos 1–11
scripts/test-casa-init        # exit 0 — regressão do bootstrap (caso 10)
python3 scripts/docs-check    # exit 0 — o próprio repo segue verde (caso 11)
```

## Revisão humana

- Legibilidade editorial nos temas claro e escuro em desktop e mobile, sem clichês visuais.
- Navegação intuitiva entre o `STANDARD.md`, as skills `casa-*` e os nós do grafo de ADRs/Specs.

## Verificação

```text
2026-11-18 · Python 3.11.2, Node.js v24.x, git 2.39.5
scripts/test-site             → 13 PASS / 0 FAIL, exit 0 (SPEC-0011 casos 1–11, incluindo execução do JS em VM para empty-states e tema)
scripts/test-casa-init        → 72 PASS / 0 FAIL, exit 0 (isolamento do casa-init + regressão SPEC-0001/0005/0008/0009/0010)
python3 scripts/docs-check    → 28 docs · 0 erro(s) · 0 aviso(s), exit 0 (--check-adr-immutability --base-ref origin/main e --staged)
bash scripts/test-docs-check  → 52 PASS / 0 FAIL · scripts/test-docs-reserve → 23 PASS / 0 FAIL · scripts/test-update-check → 14 PASS / 0 FAIL · scripts/test-install → 13 PASS / 0 FAIL
```
