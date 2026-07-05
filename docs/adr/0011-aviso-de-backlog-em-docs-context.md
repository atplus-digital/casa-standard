---
status: accepted
date: 2026-07-05
builds-on: [ADR-0002]
superseded-by: null
deciders: [maicon]
---

# docs-check aponta backlog em docs/context/ — aviso de localização

## Contexto e problema

O ADR-0002 e o §5.1 fixam o backlog em `docs/BACKLOG.md`, **fora** de `docs/context/` —
"backlog é pendência, não estado imperativo". A própria `## Confirmação` do ADR-0002 já
era executável: `test ! -e docs/context/BACKLOG.md`. Mas nenhuma ferramenta roda essa
confirmação: a regra vive em prosa.

Resultado de campo (2026-07-05): o **console-platon** — o repo-piloto — mantém o backlog em
`docs/context/BACKLOG.md` (declarado inclusive como capítulo no router), o `docs-check`
passa verde, e o desvio envelhece desde a migração sem que nada o aponte. Regra sustentada
por disciplina apodreceu, como a tese prevê.

## Direcionadores da decisão

- Mecanizar o que o padrão já decidiu (ADR-0002) — não é regra nova, é a Confirmação de
  uma decisão aceita virando código.
- Compatibilidade (§10): a introdução não pode quebrar o gate de quem está em desvio.
- Determinismo entre filesystems: o dev roda em NTFS (case-insensitive), o CI em ext4
  (case-sensitive) — o check não pode divergir entre os dois.

## Opções consideradas

### Opção 1 — Continuar em prosa
**Prós:** custo zero.
**Contras:** já falhou — o piloto está em desvio há semanas e ninguém viu. Disciplina.

### Opção 2 — Erro imediato
**Prós:** convergência forçada.
**Contras:** a primeira atualização de toolchain quebraria o gate do console-platon —
mudança que se pretende compatível não pode fazer isso (§10).

### Opção 3 — Aviso central, case-insensitive por listagem de diretório
**Prós:** visibilidade imediata sem quebrar ninguém; determinístico (lista `docs/context/`
e compara o nome em lowercase — mesmo resultado em NTFS e ext4); a regra mora no validador
(ADR-0008).
**Contras:** aviso pode ser ignorado — mitigado nomeando o sintoma de promoção a erro.

## Decisão

Opção 3. O `docs-check` lista `docs/context/` e emite **aviso** para qualquer arquivo cujo
nome em lowercase seja `backlog.md`, orientando a migração para `docs/BACKLOG.md` e a
atualização dos ponteiros do router.

Sintoma que promove o aviso a erro: um repo **criar** `docs/context/BACKLOG.md` novo já
com toolchain ≥1.4 (aviso presente e ignorado deixa de informar e passa a precisar travar),
ou o desvio de um adotante conhecido sobreviver a duas releases com o aviso ativo — em
qualquer dos casos, erro entra por ADR novo.

## Consequências

- O console-platon vê o desvio na primeira atualização de toolchain — sem quebrar o deploy.
- O `docs-reserve` (issue #12) ganha um pré-requisito verificável: poderá recusar operação
  enquanto o backlog estiver no lugar errado, em vez de criar um segundo backlog.
- `docs/BACKLOG.md` na raiz de `docs/` segue sendo o lugar certo e não gera nada.

## Confirmação

```bash
bash scripts/test-docs-check    # exit 0: cenários de localização (SPEC-0006) verdes
python3 scripts/docs-check      # exit 0: o próprio repo segue verde
```

## Notas

Gatilho: issue #17, com evidência do levantamento de adotantes de 2026-07-05. Comportamento
detalhado em SPEC-0006.
