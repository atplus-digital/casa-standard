# Changelog

## CASA 1.4 — 2026-07-05

- **`casa-version` é promessa do repo** (ADR-0010): o `casa-init` deixa de re-carimbá-la em
  router existente (insere apenas se ausente; downgrade automático deixa de existir).
  Atualizar a declaração é ato deliberado, com CHANGELOG lido.
- O `docs-check` ganha `CONTRACT_VERSION` e **avisa** quando a declaração do router diverge
  da toolchain instalada — nas duas direções (SPEC-0006). Aviso, nunca erro.
- O `docs-check` **avisa** quando existe `backlog.md` (qualquer case) em `docs/context/` —
  mecaniza a Confirmação do ADR-0002 (ADR-0011); mover para `docs/BACKLOG.md`.
- Fixtures das suítes de teste passam a derivar a versão das constantes dos scripts.
- Apêndice A.5 registra a dívida de cadência de atualização de adotantes.

## CASA 1.3 — 2026-07-05

- O `casa-init` cria, quando ausente, a **ponte `CLAUDE.md`** (`@AGENTS.md`): o Claude Code
  não lê `AGENTS.md`, e sem a ponte o router fica invisível para ele (ADR-0009, SPEC-0005).
- `CLAUDE.md` existente é identidade do repo — nunca sobrescrito; sem `@AGENTS.md` no corpo,
  o `casa-init` emite AVISO. Pontes por host formam conjunto **fechado** no `casa-init`
  (hoje: só Claude Code); host novo entra por ADR.
- Novo template distribuído: `docs/templates/CLAUDE.template.md`.
- Mudança compatível; o `docs-check` não muda — a ponte não é validada pelo gate (contrato
  agnóstico de host; restaurá-la é papel do `casa-init`).

## CASA 1.2 — 2026-06-20

- Introduz **capítulos de contexto reconhecidos** (registry fechado): declarar o ponteiro
  no router dispara um invariante de conteúdo que mora no `docs-check` (ADR-0008, SPEC-0004).
- Primeiro membro: `docs/context/TESTS.md` declarado exige ao menos um comando canônico.
- Adiciona o template `docs/templates/context.TESTS.template.md`, distribuído pelo `casa-init`.
- Mudança compatível: o gatilho é a **declaração no router**, nunca a presença do arquivo;
  a regra é central e versionada — repo adotante nunca traz a própria validação.

## CASA 1.1 — 2026-06-13

- Define mantenedor do padrão: atplus-digital/maicon.
- Adiciona `casa-version` ao router para separar contrato CASA de snapshot da toolchain.
- Valida metadados mínimos do `AGENTS.md`, DoD global e ponteiros de contexto.
- Endurece Specs `accepted`/`implemented`: sem questões abertas, DoD sem placeholder e
  `implemented-by` apontando para paths existentes.
- Adiciona lint de imutabilidade de ADR aceito para CI.

## CASA 1.0 — 2026-06-09

- Promove o CASA após piloto verde no `docs-check`.
- Estabelece router, ADRs, Specs, automação, `casa-init` e bootstrap `install.sh`.
