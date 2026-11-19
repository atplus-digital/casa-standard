---
status: accepted
date: 2026-11-18
builds-on: [ADR-0004, ADR-0009, ADR-0010, ADR-0012]
superseded-by: null
deciders: [maicon]
---

# Ciclo de entrega como Agent Skills: o agente executa o §9; verificação por agente é assistiva, nunca gate

## Contexto e problema

O ciclo de entrega (STANDARD §9) é prosa: o agente precisa ler o padrão, lembrar a ordem e
aplicar as regras sozinho. Os pontos que o próprio STANDARD chama de mais frágeis — a
propagação do fechamento (gotchas → router, estado → capítulo, §5.2) e o vínculo caso de
borda ↔ DoD (§7, ADR-0012) — ficam na revisão humana do PR, isto é, em disciplina.

A evidência de campo aponta o mesmo buraco. O relatório consolidado CASA × atplus
(2026-11-18) mostra specs fechadas com DoD verde cujos testes não alcançavam a consequência
real: banco simulado no lugar dos gatilhos reais (ATPlus Vision, SPEC-0049), transporte
simulado no lugar do runtime (Console Platon). A pergunta de revisão que pegaria esses casos
— "em que situação este teste passaria com a entrega quebrada?" — não está em lugar nenhum
do fluxo do agente.

Em 2026-11-18, o mercado já tinha transformado fluxos assim em procedimento executável: o OpenSpec distribui
`explore → propose → apply → verify → archive` como comandos do agente; o Spec Kit,
`specify → plan → tasks → implement` com `analyze`. O formato portável é o **Agent Skills**
(agentskills.io): diretório `<nome>/SKILL.md` com `name` e `description` no frontmatter; o
agente carrega só a descrição no início e o corpo quando a tarefa casa. Na mesma data, a
convenção de projeto entre clientes era `.agents/skills/`, e o Claude Code lia apenas
`.claude/skills/`.

## Direcionadores da decisão

- **Automação, não disciplina:** o elo frágil precisa virar procedimento que o agente roda.
- **O gate continua determinístico:** sem LLM e sem rede no gate (ADR-0010); verificação feita
  por agente não aprova nem reprova nada sozinha.
- **Um fato mora num arquivo só:** a skill aponta para o STANDARD e para os comandos da
  toolchain; não copia regra.
- **Portabilidade entre agentes:** formato aberto, sem campo específico de um host.
- **Custo de contexto:** cada skill custa a descrição (~100 tokens) em toda sessão; poucas e
  com descrição precisa.
- **Sem obrigação nova para o adotante:** o contrato (o que o repo promete) não muda.

## Opções consideradas

### Opção 1 — Manter o §9 como prosa
**Prós:** zero custo. **Contras:** o elo frágil segue humano; cada agente reinterpreta o
ciclo; o caso Vision se repete.

### Opção 2 — Adotar o OpenSpec por inteiro
**Prós:** fluxo pronto, mantido e popular. **Contras:** troca o modelo da camada Spec
(spec viva + deltas), traz `tasks.md`, que o §3 delega ao tracker, e exige CASA 2.0. Merece
piloto próprio, não adoção por arrasto.

### Opção 3 — Skills `casa-*` que executam o §9, distribuídas pelo `casa-init`
**Prós:** usa o formato aberto; mapeia 1:1 para o ciclo que já existe; põe a pergunta de
revisão no fluxo do agente; chega pelo mesmo canal da toolchain. **Contras:** cinco
descrições a mais no contexto de toda sessão; duas cópias por repo (uma por convenção de
diretório).

### Opção 4 — Verificação por agente como gate no CI
**Prós:** fecharia o elo frágil "à força". **Contras:** não-determinística, com custo e rede
no gate (contra ADR-0010); falso positivo trava merge sem critério binário.

## Decisão

Opção 3. O `casa-standard` mantém cinco skills em `docs/templates/skills/`, uma por etapa do
§9, só com os campos portáveis (`name`, `description`):

| Skill | Etapa | O que faz |
|---|---|---|
| `casa-explore` | §9.4 | router → capítulos do Mapa → subgrafo de ADRs/Specs → código; aponta o gatilho do §3 |
| `casa-propose` | §9.1–3 | decide ADR/Spec/nada, reserva com `docs-reserve`, EARS e DoD com comandos reais |
| `casa-apply` | §9.4–5 | implementa Spec aceita até o DoD verde; questão em aberto bloqueia |
| `casa-verify` | §7, §5.2 | DoD + `docs-check` e auditoria caso↔teste — **assistiva, nunca gate** |
| `casa-close` | §9.6 | fechamento atômico num commit |

O `casa-init` instala as cinco num conjunto **fechado** de diretórios: `.agents/skills/`
(convenção entre clientes) e `.claude/skills/` (o Claude Code não lê a convenção — mesma
lógica da ponte do ADR-0009). Diretório de host novo entra por ADR. As skills `casa-*` são
**da toolchain**: atualizadas quando divergem do template; skill do repo com outro nome
nunca é tocada — quem quer customizar cria a sua com outro nome.

Cada skill aponta o §N do `STANDARD.md` por link no **snapshot da toolchain instalada**: o
template usa `blob/main/` e o `casa-init` carimba o `casa-standard-ref` do adotante — o
`STANDARD.md` não é copiado para o repo. Skill retirada ou renomeada entra numa lista de
aposentadas que o `casa-init` remove do adotante (só se tiver marcador CASA, preservando
homônima alheia; em repo T0, skills `casa-*` anteriores também saem). Diretório de skill que
não dá para escrever (ex.: `.claude` é arquivo) ou que está no `.gitignore` vira AVISO, sem
derrubar o resto da instalação.

O `docs-check` não valida skills (não são gate). As skills entram no §2/§9 do STANDARD, o
que é mudança **compatível** de contrato: a aceitação sobe a versão menor (CASA 1.10;
ADR-0010), para o `casa-update-check` avisar os adotantes.

## Consequências

- O ciclo vira procedimento executável e portável; `/casa-verify` leva para dentro do fluxo
  do agente a pergunta que o elo frágil não fazia.
- Toda sessão paga as cinco descrições no contexto (~1,5 mil caracteres) — dez, em cliente
  que lê os dois diretórios; elas precisam continuar curtas e específicas.
- O adotante passa a ter `.agents/skills/casa-*` e `.claude/skills/casa-*`, idênticos e
  gerados; cliente que lê os dois diretórios vê o mesmo nome duas vezes, com o mesmo
  conteúdo.
- O próprio `casa-standard` (`casa-standard-ref: self`, onde o `casa-init` não opera) mantém
  apenas a fonte única em `docs/templates/skills/`, sem duplicar cópias em `.agents/` e
  `.claude/`.
- Texto de skill pode envelhecer em relação ao STANDARD: os testes conferem formato, a
  identidade das duas cópias, que todo `scripts/…` citado existe na toolchain e que toda
  seção `§N` / `§N.M` citada existe no STANDARD. Que a skill não traga regra própria é
  revisão humana.
- Fica para decisão própria: `docs-check --json` (saída estruturada para o `casa-verify`) e
  o modelo de spec viva com deltas do OpenSpec (piloto).

## Confirmação

```bash
scripts/test-casa-init   # SPEC-0010: skills nos dois diretórios, idênticas, formato válido, comandos e seções existentes
```

## Notas

Gatilhos: revisão de 2026-11-18 (análise de mercado: OpenSpec, Spec Kit, Agent Skills) e
relatório consolidado CASA × atplus. Especificação do formato: agentskills.io/specification.
