---
status: implemented
date: 2026-07-08
builds-on: [SPEC-0003]
implemented-by:
  - scripts/docs-check
  - scripts/test-docs-check
  - STANDARD.md
---

# docs-check compara READMEs gerados por conteudo canônico

## Objetivo

O `docs-check` continua gerando `docs/adr/README.md` e `docs/specs/README.md` como
índices oficiais, mas a etapa de validação deixa de depender de igualdade textual bruta.
A comparação passa a aceitar diferenças cosméticas de formatação quando o conteúdo da
tabela gerada é o mesmo.

## Fluxo

1. `scripts/docs-check --emit-index` segue emitindo os READMEs canônicos e `docs/index.json`.
2. Na validação normal, o script interpreta o README como índice gerado, normaliza a
   estrutura da tabela e compara essa forma canônica com o conteúdo emitido em memória.
3. Se a forma canônica for igual, o arquivo passa mesmo que um formatter tenha ajustado
   espaços, linhas em branco ou alinhamento visual da tabela.
4. Se o conteúdo real mudar, o arquivo continua falhando.

## Contrato

- A comparação de READMEs gerados ignora apenas diferenças cosméticas equivalentes.
- O comentário de arquivo gerado e o H1 continuam fazendo parte do contrato do índice.
- O cabeçalho e as linhas da tabela continuam sendo a fonte da verdade do índice.
- `docs/index.json` continua em comparação textual exata.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | o README gerado só muda em whitespace, linhas em branco ou alinhamento visual | passar no `docs-check` |
| 2 | o texto de `status` de uma linha muda | falhar por divergência de conteúdo |
| 3 | o link do `id` muda | falhar por divergência de conteúdo |
| 4 | uma linha é removida, incluída ou reordenada | falhar por divergência de conteúdo |
| 5 | o marcador `GERADO` ou o cabeçalho do índice some | falhar porque o arquivo não é um README gerado válido |

## Questões em aberto

(nenhuma — spec fechada)

## Definition of Done

```bash
bash scripts/test-docs-check   # casos 1–5 verdes
python3 scripts/docs-check     # exit 0 no repo
```

## Revisão humana

- A normalização aceita somente a tabela gerada e não abre espaço para Markdown arbitrário.
- As mensagens de erro deixam claro quando o problema é formatação cosmética versus
  conteúdo alterado.

## Verificação

 ```text
 2026-07-08 · bash scripts/test-docs-check → 26 PASS / 0 FAIL (SPEC-0009 casos 1–5 cobertos), exit 0
2026-07-08 · python3 scripts/docs-check → 24 docs · 0 erro(s) · 0 aviso(s), exit 0
 ```
