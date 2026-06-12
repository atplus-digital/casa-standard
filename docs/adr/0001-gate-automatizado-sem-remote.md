---
status: superseded
date: 2026-06-09
builds-on: []
superseded-by: ADR-0006
deciders: [maicon]
---

> ⚠️ VERDADE ATUAL: o princípio segue valendo — gate automatizado por CI ou pre-commit
> hook, nunca disciplina. Revogado: o despacho "com remote → CI" (instalava workflow do
> GitHub em qualquer host). Regra atual: por host do remote — ver ADR-0006.

# Gate automatizado do T1 vale por CI ou pre-commit hook — nunca por disciplina

## Contexto e problema

O STANDARD §3 definia T1 como "tudo deste documento, com `docs-check` no CI". O repo-piloto
(console-platon) não tem remote — logo não tem CI possível — e o agente de adoção improvisou
colocando o `docs-check` no DoD global do router. Isso é gate documental: só roda se alguém
lembrar. Pelo critério de design do padrão ("complexidade sustentada por disciplina humana
apodrece"), um T1 sem gate automatizado é T1 de fachada.

## Direcionadores da decisão

- Critério de design do padrão: validação por ferramenta, não por disciplina.
- Repo offline/local é caso real (o próprio piloto), não exceção teórica.
- O gate precisa rodar sem depender de memória humana nem de infraestrutura externa.

## Opções consideradas

### Opção 1 — Manter CI obrigatório
**Prós:** gate inviolável no merge; sem ambiguidade.
**Contras:** repo sem remote fica formalmente fora do T1; convida a declaração de tier falsa.

### Opção 2 — Aceitar o DoD do router como gate
**Prós:** custo zero.
**Contras:** é disciplina sem validação — exatamente o que o padrão proíbe.

### Opção 3 — Pre-commit hook como gate local equivalente
**Prós:** automação real sem remote; roda em todo commit; instalação de uma linha.
**Contras:** contornável com `--no-verify`; instalação é por clone (o git não versiona hooks).

## Decisão

Opção 3. T1 exige `docs-check` em **gate automatizado**: CI quando há remote; **pre-commit
hook** quando não há. O repo de referência fornece os dois adaptadores (`.github/workflows/
docs-check.yml` e `scripts/pre-commit`). Contorno via `--no-verify` é aceito: é ato
deliberado e visível, não esquecimento.

## Consequências

- Repo sem remote pode ser T1 legítimo.
- Ao ganhar remote, o CI entra e o hook vira redundância barata (mantém feedback local rápido).
- Para o adotante: instalar o hook na adoção (§10) quando não houver CI.
- STANDARD §2, §3, §8 e §10 atualizados no mesmo commit que aceita este ADR.

## Confirmação

```bash
test -f .github/workflows/docs-check.yml || grep -q docs-check .git/hooks/pre-commit   # exit 0: algum gate existe
```

## Notas

Aprendizado do piloto console-platon (adoção de 2026-06-09).
