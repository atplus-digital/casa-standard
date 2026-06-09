# CASA Standard

**Contexto · ADRs · Specs · Automação** — padrão de workflow de desenvolvimento para times onde agentes de IA (Claude Code, Cursor, Opencode, Codex e similares) são executores de primeira classe.

Critério de design: **complexidade sustentada por automação é barata; complexidade sustentada por disciplina humana apodrece.** Tudo no padrão é validado por ferramenta ou custa quase nada.

## Os quatro pilares

| | O quê | Onde |
|---|---|---|
| **C**ontexto | Estado atual em camadas de custo de contexto: router `AGENTS.md` + capítulos sob demanda | `AGENTS.md`, `docs/context/` |
| **A**DRs | Decisões estruturais, datadas e imutáveis (MADR 4.0 + Confirmação) | `docs/adr/` |
| **S**pecs | Comportamento observável com DoD executável | `docs/specs/` |
| **A**utomação | `docs-check` valida frontmatter, grafo e higiene no CI | `scripts/docs-check` |

## Conteúdo deste repo

- **[STANDARD.md](STANDARD.md)** — o documento normativo. É a fonte da verdade.
- **[docs/templates/](docs/templates/)** — templates oficiais de `AGENTS.md`, ADR e Spec.
- **[scripts/docs-check](scripts/docs-check)** — implementação de referência do validador de CI (Python, sem dependências).

## Começando

Para adotar num repo existente, siga a ordem incremental do [STANDARD.md §10](STANDARD.md). Para validar um repo localmente:

```bash
python3 scripts/docs-check               # valida; exit 1 se houver erro
python3 scripts/docs-check --emit-index  # regenera os README.md das pastas de docs e docs/index.json
python3 scripts/docs-check --warn-only   # imprime tudo e sai 0 (só na janela de adoção)
```

## Status

`proposed` — em piloto. O padrão só é promovido para uso amplo depois que um repo-piloto passa verde no `docs-check` (STANDARD §7). Mudança é PR com conversa.

## Licença

[MIT](LICENSE) © atplus-digital
