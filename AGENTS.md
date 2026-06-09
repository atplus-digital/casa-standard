# AGENTS.md

```yaml
casa-repo-id: casa-standard
casa-tier: T1
```

> ROUTER (CASA §4): carga sempre, teto ~150 linhas. Só alto-ROI transversal.
> Este repo É a referência do CASA Standard — ele segue o próprio padrão.

## Contexto em 5 linhas

Este repo é a fonte da verdade do **CASA Standard** (Contexto, ADRs, Specs, Automação),
o padrão de workflow de desenvolvimento orientado a agentes da atplus-digital. Contém o
documento normativo (`STANDARD.md`), os templates oficiais (`docs/templates/`) e a
implementação de referência do validador (`scripts/docs-check`, Python sem dependências).
Não há aplicação para rodar — o "produto" é a doc + o script.

## Como validar (DoD global do repo)

```bash
python3 scripts/docs-check          # exit 0; é o mesmo comando que o CI roda
```

## Git & PRs

Mudança no padrão é PR com conversa (STANDARD §10). `STANDARD.md` é normativo: alterou o
comportamento do `docs-check`, atualize a §8 no mesmo PR — doc e código não divergem.

## Gotchas

<!-- Conhecimento NÃO-INFERÍVEL que já custou tentativas falhas. -->

- O `docs-check` aceita só um **subconjunto** de YAML no frontmatter (escalar, lista inline,
  lista em bloco). Sintaxe fora disso é ERRO proposital, não silêncio — ver STANDARD §6.
- Erro = `exit 1` por padrão. `--warn-only` sai 0 e existe só para a janela de adoção.
- Os `README.md` de `docs/adr|specs/` são **gerados** por `--emit-index`; nunca editar à mão.
  O check de frescor falha se o commitado divergir do gerado.
- O script é executável sem extensão (`scripts/docs-check`); o CI o invoca via `python3`.

## Mapa de contexto

<!-- Capítulos docs/context/ — ainda não há nenhum neste repo. -->

| Capítulo | Quando carregar |
|---|---|
| (nenhum ainda) | — |

## Mapa de docs

- Padrão normativo: `STANDARD.md` · Templates: `docs/templates/`
- Decisões: `docs/adr/` · Comportamento: `docs/specs/` (READMEs GERADOS — não editar)
- Pendências e reservas de NNNN: `docs/BACKLOG.md` (reserve lá antes de criar ADR/Spec novo)
- Validar: `scripts/docs-check` · Regenerar índices: `scripts/docs-check --emit-index`
