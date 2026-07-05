---
status: accepted
date: 2026-07-05
builds-on: [ADR-0002, ADR-0011, ADR-0003]
superseded-by: null
deciders: [maicon]
---

# docs-reserve automatiza a reserva de NNNN; o ledger ganha formato de tabela por seção

## Contexto e problema

O CASA manda reservar o próximo `NNNN` em `docs/BACKLOG.md` antes de criar ADR/Spec (§5,
ADR-0002). A operação é manual: escolher número, criar arquivo do template, ajustar data e
H1, registrar a reserva. Em trabalho paralelo isso colide — o linee-chat opera com várias
worktrees simultâneas reservando à mão — e o `docs-check` só pega id duplicado pós-merge,
quando renumerar já cascateia nos `builds-on` (issue #12).

Levantamento de campo (2026-07-05): os adotantes já divergiram em três formatos de ledger —
prosa com ranges (console-platon), tabelas `| ID | Arquivo | Status |` (linee-*,
qualimonitor) e a prosa enumerada deste repo. Qualquer automação precisa decidir o formato
— e decidir o que fazer com linha que não entende.

## Direcionadores da decisão

- Tirar da mão humana a parte em que ela tropeça (número, slug, data, template), sem
  prometer o que filesystem local não entrega (lock distribuído — a issue #12 já descarta).
- **Nada passa em silêncio** (ADR-0003): reserva ilegível ignorada em silêncio reintroduz a
  colisão que a ferramenta existe para impedir, com confiança indevida — pior que a mão nua.
- Adotar o que o campo já pratica: 3 de 5 repos convergiram em tabela — formato novo do
  zero seria um quarto padrão.
- O `docs-check` continua a autoridade (ADR-0002 intacto: BACKLOG não é camada validada
  pelo gate); o contrato de formato é do **comando**, não da camada documental.

## Opções consideradas

### Opção 1 — Manter reserva manual (status quo)
**Prós:** zero código. **Contras:** a dor é real e recorrente; erro humano em número/slug/
data/placeholder é exatamente o que automação barata elimina.

### Opção 2 — Formato novo em prosa estruturada, parse tolerante
**Prós:** parecido com o ledger atual deste repo. **Contras:** prosa é ambígua de parsear;
tolerância = pular linha em silêncio = colisão silenciosa (anti-ADR-0003); ignora que o
campo já convergiu em tabela.

### Opção 3 — Tabela por seção (formato do campo), parse estrito e barulhento
**Prós:** `## Reservas ADR` / `## Reservas Spec` com `| NNNN | título | data | situação |`
é o formato que os adotantes praticamente já usam (o parser aceita `ADR-NNNN`/`SPEC-NNNN`
na primeira célula para reduzir fricção de migração); linha ilegível dentro da seção é
**apontada** com instrução, nunca lida em silêncio; próximo número = max(arquivos,
reservas)+1 respeita reserva manual e nunca reutiliza lacuna (renumerar cascateia, §5).
**Contras:** os ledgers existentes precisam migrar a seção de reservas — barato, e o aviso
diz exatamente o quê.

## Decisão

Opção 3. Novo `scripts/docs-reserve` (Python sem dependências, distribuído na toolchain do
`casa-init`): `docs-reserve adr|spec "título" [--dry-run] [--no-emit-index]` — calcula o
próximo `NNNN`, cria o doc a partir do **template do repo** (data de hoje; H1 = título;
status inicial é o default do template: `proposed`/`draft`), registra a linha na tabela e
regenera os índices. Nunca sobrescreve; recusa título sem slug ASCII; **recusa operar** se
o backlog está em `docs/context/` (ADR-0011) — não cria segundo ledger. Sem `--id` manual
(a mão humana é o que tropeça; migração de doc legado é `git mv`, não reserva) e sem
comando de cancelamento (a tabela é editável à mão; o resto do BACKLOG segue livre,
ADR-0002).

**Escopo honesto:** worktrees/branches paralelas do mesmo repo **continuam podendo
colidir** — cada checkout vê o próprio BACKLOG. O que muda: a colisão vira **conflito
textual da tabela no merge/rebase** (sinal cedo) em vez de id duplicado pós-merge (sinal
tarde), e o erro de digitação morre. Extensão futura contemplada: consultar branches
irmãs locais (`git for-each-ref`) antes de sugerir o número.

## Consequências

- `CONTRIBUTING.md` e §5 passam a recomendar o comando; a linha "Próximo livre" dos ledgers
  morre (o comando é quem calcula; linha calculada à mão se autocontradiz no primeiro uso).
- O ledger deste repo migra para o formato de tabela **neste PR** (dogfood).
- Repos com seção de reservas em prosa recebem AVISO linha a linha até migrar — a operação
  continua, mas o aviso manda migrar antes de confiar no número.
- `casa-init` distribui e atualiza o script como o resto da toolchain.

## Confirmação

```bash
bash scripts/test-docs-reserve   # exit 0: cenários da SPEC-0007 verdes
python3 scripts/docs-check       # exit 0: o próprio repo segue verde
```

## Notas

Gatilho: issue #12; formato-tabela e parse barulhento vêm da revisão adversarial de
2026-07-05 (evidência dos três formatos de campo e do risco de skip silencioso).
Comportamento detalhado: SPEC-0007.
