---
status: accepted
date: 2026-06-13
builds-on: [ADR-0003, ADR-0004, ADR-0006]
superseded-by: null
deciders: [maicon]
---

# Governança versionada e invariantes mínimos entram no core do CASA

## Contexto e problema

O CASA já tinha o `casa-standard-ref` no router, mas esse campo dizia apenas de qual
snapshot da ferramenta o repo veio. Ele não respondia à pergunta mais importante para um
adotante: "qual contrato do padrão este repo promete seguir?". Ao mesmo tempo, o ponto de
entrada do agente (`AGENTS.md`) era pouco validado, Specs podiam chegar a estados finais
com placeholders ou pendências abertas, e a imutabilidade dos ADRs aceitos ainda estava no
Apêndice A. O resultado era um padrão forte na intenção, mas com lacunas exatamente nos
invariantes que mais protegem repos adotantes.

## Direcionadores da decisão

- O padrão precisa ser atualizável sem virar mudança silenciosa de contrato.
- O router é load-bearing: se ele estiver incompleto, o agente começa errado.
- Specs aceitas/implementadas devem estar decididas e verificáveis, não apenas formatadas.
- ADR aceito é a memória causal do repo; emenda substantiva apaga a trilha de decisão.
- A referência `casa-standard` deve provar esses invariantes no próprio CI.

## Opções consideradas

### Opção 1 — Manter tudo como disciplina de PR
**Prós:** custo zero de implementação.
**Contras:** contradiz o critério de design do CASA; as lacunas aparecem tarde, quando o
repo adotante já confia no padrão.

### Opção 2 — Criar um tier novo para governança e checks estritos
**Prós:** evita aumentar o peso do T1.
**Contras:** transforma invariantes básicos em opcional; o T1 continuaria aceitando router
fraco, Spec com placeholder e ADR emendado.

### Opção 3 — Promover os invariantes ao core e versionar o contrato
**Prós:** todo repo T1 ganha a mesma base de confiança; `casa-version` separa contrato do
snapshot da toolchain; a migração fica explícita.
**Contras:** repos adotantes antigos precisam rodar `casa-init` para receber o novo campo
e corrigir pendências que antes passavam.

## Decisão

Opção 3. O CASA passa a ter `casa-version` no router, mantido pelo `casa-init`, além do
`casa-standard-ref`. A versão 1.1 promove ao core: validação mínima do router, validação
mais forte de Specs em estados finais, verificação de paths reais em `implemented-by` e
lint opcional de imutabilidade de ADR aceito para CI. O mantenedor do padrão deixa de ser
placeholder e passa a ser explícito no `STANDARD.md`.

## Consequências

- Repos adotantes conseguem distinguir "toolchain veio deste commit" de "contrato CASA é
  1.1".
- `docs-check` passa a falhar cedo quando o router não tem metadados CASA ou DoD global.
- Specs `accepted`/`implemented` não podem manter questões abertas ou placeholders no DoD.
- Specs `implemented` precisam apontar `implemented-by` para paths existentes.
- CI pode bloquear qualquer emenda de corpo em ADR aceito comparando contra a base do PR.

## Confirmação

```bash
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main
bash scripts/test-docs-check
```

## Notas

Gatilho: revisão do padrão em 2026-06-13, que identificou governança indefinida,
versionamento parcial, router pouco validado, Specs frouxas e imutabilidade ainda fora do
core.
