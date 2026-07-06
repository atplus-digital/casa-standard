# Changelog

## CASA 1.8 — 2026-07-06

- **Detecção agendada de contrato desatualizado, fora do gate** (ADR-0016, SPEC-0008):
  novo `scripts/casa-update-check` + workflow cron semanal, distribuídos pelo `casa-init`
  a remotes GitHub (adaptador por host, ADR-0006). Mantém **uma issue** com label
  `casa-update` no tracker do repo — criada quando o contrato declarado fica atrás do
  vigente, editada enquanto durar, fechada sozinha quando o repo alcança.
- Regras duras: exit 0 sempre que o mundo externo falhar (rede, versões ilegíveis) — o
  job nunca fica vermelho; comparação por versão de contrato, nunca por SHA; rede no
  `docs-check`/gate continua proibida (ADR-0010).
- A.5 atualizado: a metade "verificação externa ao gate" está paga para GitHub; resto
  segue processo.

## CASA 1.7 — 2026-07-05

- **UI tem endereço no método** (ADR-0014): decisão estrutural (design system, tokens,
  estados obrigatórios) → ADR do repo, uma vez; comportamento visual da feature → casos de
  borda EARS comuns na Spec, sob a regra de DoD do §7 (comandos reais do repo — nunca
  exemplo fictício); estética → `## Revisão humana`. Sem quinto pilar, sem template novo.
- **`design-ref` entra no vocabulário fechado central** (§6): escalar, URL ou path
  relativo, **não-normativo** (código+snapshot ganham em divergência), exportado ao
  `docs/index.json`, sem validação de forma. Bloco de orientação de UI no
  `spec.template.md`.

## CASA 1.6 — 2026-07-05

- **Novo `scripts/docs-reserve`** (ADR-0013, SPEC-0007): reserva o próximo `NNNN` e cria a
  ADR/Spec do template (data de hoje, H1 = título, slug ASCII), registrando a reserva no
  ledger. Distribuído pela toolchain do `casa-init`.
- O ledger (`docs/BACKLOG.md`) ganha formato de tabela por seção (`## Reservas ADR` /
  `## Reservas Spec`, `| NNNN | título | data | situação |`) — o formato que os adotantes
  já praticavam; primeira célula com prefixo (`ADR-NNNN`) também é aceita. Linha ilegível
  na seção é **apontada**, nunca lida em silêncio. A linha "Próximo livre" morre.
- O comando recusa operar com backlog em `docs/context/` (ADR-0011) — não cria segundo
  ledger — e não coordena worktrees paralelas (escopo honesto: a proteção é o conflito
  textual da tabela no merge).
- `CONTRIBUTING.md` e §5 recomendam o comando; reserva manual continua válida.

## CASA 1.5 — 2026-07-05

- **§7: o DoD fecha o loop da spec, não só o do repo** (ADR-0012): cada caso de borda
  enumerado exige linha de DoD ou teste que o exercite (números citados no comentário);
  DoD subconjunto do DoD global é sinal de spec sem fechamento próprio. Verificação humana
  do PR — a heurística mecânica foi avaliada e rejeitada por falso-positivo no
  repo-referência (registrada como extensão futura na issue #16).
- **§5.2: entrega incremental divide a spec ou corta o escopo** (ADR-0012): spec
  guarda-chuva meio-implementada não existe; ao dividir, a original vira `deprecated`.
- Aplicabilidade: specs novas e tocadas. Doc-only — o `docs-check` não muda (só o bump de
  `CONTRACT_VERSION`/`CASA_VERSION`).

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
