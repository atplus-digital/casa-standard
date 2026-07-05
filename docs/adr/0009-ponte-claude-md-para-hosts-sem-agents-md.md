---
status: accepted
date: 2026-07-05
builds-on: [ADR-0004, ADR-0008]
superseded-by: null
deciders: [maicon]
---

# Ponte CLAUDE.md: host que não lê AGENTS.md recebe um arquivo de importação, criado pelo casa-init

## Contexto e problema

O router CASA vive em `AGENTS.md` (§4) — o nome com adoção multi-vendor (Cursor, Codex,
opencode e similares). O Claude Code, porém, **não lê `AGENTS.md`**: sua memória de projeto
é o `CLAUDE.md`, e a documentação oficial recomenda, para repos que padronizam em
`AGENTS.md`, exatamente um `CLAUDE.md` que o importe via `@AGENTS.md`. Resultado hoje: um
repo bootstrapped pelo `casa-init` nasce com o router **invisível para o agente executor
mais usado nos projetos da empresa** (issue #7).

O sintoma já apareceu em campo: o linee-chat criou à mão um `CLAUDE.md` contendo só
`@AGENTS.md` — cada adotante redescobrindo o problema e resolvendo por disciplina,
justamente o que a tese do padrão recusa.

## Direcionadores da decisão

- **Um fato mora num arquivo só** (Princípio 2): o conteúdo do router não pode ser
  duplicado por host de agente.
- **Complexidade sustentada por automação**: a ponte é instalada e restaurada por
  ferramenta (`casa-init`), nunca por checklist de onboarding.
- **Portabilidade**: a solução precisa funcionar em Windows/Linux/macOS sem privilégio
  especial — symlink não cumpre isso no Windows.
- **Precedente do registry fechado** (ADR-0008): acomodação por host entra deliberada e
  central, não improvisada pelo repo adotante.
- A proibição de `@import` no router (§4) existe para proteger o orçamento de contexto
  contra colagem de capítulos — não para impedir a importação do próprio router, que é
  carga-sempre por definição.

## Opções consideradas

### Opção 1 — Renomear o router para CLAUDE.md
**Prós:** nenhum arquivo extra para o Claude Code.
**Contras:** inverte o problema — os demais hosts leem `AGENTS.md`, não `CLAUDE.md`; o
padrão ficaria acoplado ao nome de um vendor, contra a tendência multi-vendor do
`AGENTS.md`.

### Opção 2 — Symlink `CLAUDE.md → AGENTS.md`
**Prós:** fonte única sem segundo arquivo de conteúdo.
**Contras:** symlink exige privilégio/Developer Mode no Windows (ambiente real dos
adotantes); vira cópia materializada em zip e em alguns clientes git; a própria doc do
Claude Code o lista como alternativa com essa ressalva.

### Opção 3 — Duplicar o conteúdo do router nos dois arquivos
**Prós:** nenhum que sobreviva a uma semana.
**Contras:** multi-fonte-da-verdade; viola o Princípio 2 frontalmente; diverge no primeiro
edit.

### Opção 4 — Arquivo-ponte `CLAUDE.md` com `@AGENTS.md`, criado pelo casa-init quando ausente
**Prós:** é a recomendação oficial do host; portátil (arquivo de texto comum); o `@import`
expande o router inteiro no launch — semântica desejada, router é carga-sempre; instalada
e restaurada por ferramenta; dá um lugar sancionado para instruções específicas do Claude
Code (abaixo do import), sem poluir o router multi-host.
**Contras:** mais um arquivo na raiz; a lista de pontes por host precisa de manutenção
(hoje: uma).

## Decisão

Opção 4. O `casa-init` passa a criar, **quando ausente**, um `CLAUDE.md` mínimo a partir de
`docs/templates/CLAUDE.template.md`, cuja primeira linha útil é `@AGENTS.md`. `CLAUDE.md`
existente é **identidade do repo** — nunca é sobrescrito nem editado; se não contiver
`@AGENTS.md`, o `casa-init` emite AVISO. O conjunto de pontes por host é **fechado** e vive
no `casa-init` — hoje só o Claude Code precisa de ponte; host novo entra por ADR neste repo
(o mesmo custo deliberado do ADR-0008). O `docs-check` **não** valida a ponte: o contrato
normativo permanece agnóstico de host; restaurar a ponte é papel do `casa-init` (toda
atualização a recria se removida). Mudança compatível: promove o contrato a `casa-version`
1.3.

## Consequências

- Repo bootstrapped nasce legível pelo Claude Code sem passo manual; adotantes existentes
  ganham a ponte na próxima rodada de `casa-init`.
- A exceção ao "não use `@import` no router" fica explícita e delimitada: a ponte importa o
  router por design; a proibição do §4 segue valendo para capítulos.
- `CLAUDE.md` vira o lugar sancionado para instrução específica de Claude Code — abaixo do
  import, sem tocar o router.
- Fica explicitamente **fora**: validação da ponte no `docs-check`; ponte para host que já
  lê `AGENTS.md`.

## Confirmação

```bash
bash scripts/test-casa-init     # exit 0: cenários da ponte (SPEC-0005) verdes
python3 scripts/docs-check      # exit 0: o próprio repo segue verde
```

## Notas

Gatilho: issue #7 e a verificação na documentação oficial do Claude Code (How Claude
remembers your project) de que `AGENTS.md` não é lido nativamente — a recomendação de lá é
o próprio shim `@AGENTS.md`. Comportamento detalhado em SPEC-0005. Este repo pratica a
decisão: o `CLAUDE.md` da raiz é a ponte instanciada.
