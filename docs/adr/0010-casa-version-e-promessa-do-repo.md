---
status: accepted
date: 2026-07-05
builds-on: [ADR-0007, ADR-0004]
superseded-by: null
deciders: [maicon]
---

# casa-version é promessa do repo: o casa-init não a carimba; o docs-check sinaliza incoerência

## Contexto e problema

O §10 define `casa-version` como "o contrato normativo que o repo adotante **promete**
seguir" (ADR-0007). Mas o `casa-init` atropela a promessa: `upsert_router_meta` reescreve
`casa-version` **incondicionalmente** a cada execução — inclusive para baixo, se rodado de
um snapshot antigo. Na prática o campo é um **eco da toolchain**, redundante com
`casa-standard-ref`.

A issue #15 propunha um aviso de drift comparando a declaração do router com a versão da
toolchain instalada. A revisão adversarial da proposta (três revisores independentes,
2026-07-05) refutou o desenho original com reprodução em sandbox: com o auto-carimbo,
declaração e toolchain viajam juntas pelo caminho sancionado — **o aviso nunca dispararia**.
E o caso motivador é pior: o console-platon (CASA 1.1) ganhou remote GitHub depois da
adoção e não tem gate nenhum — nenhum aviso embutido em toolchain desatualizada o alcança.

## Direcionadores da decisão

- **Promessa pertence ao promitente.** Um campo que a ferramenta sobrescreve não promete
  nada; §10 sempre disse "promete seguir".
- **Aviso precisa ser disparável e acionável** — "um gate que simula proteção é pior que
  ausência de gate" (critério do ADR-0006).
- **Sem rede no gate** (ADR-0005/ADR-0006): a comparação tem que ser local e determinística.
- Atualizar contrato é ato com leitura de CHANGELOG e verificação de conformidade — decisão
  humana/agente do repo, não efeito colateral de copiar scripts.

## Opções consideradas

### Opção 1 — Manter o auto-carimbo e avisar comparando declaração × toolchain
**Prós:** não muda o casa-init.
**Contras:** refutada empiricamente — o casa-init iguala os dois lados no mesmo run
(sandbox: router 1.1 → 1.3 automático); o aviso compara o eco com a própria fonte e nunca
dispara em fluxo sancionado. Check-vitrine: parece proteção, não executa.

### Opção 2 — Verificar a versão contra a origem (rede)
**Prós:** detectaria atraso absoluto (repo que nunca atualiza).
**Contras:** gate deixa de ser determinístico e local; dependência de rede/serviço no CI —
contra ADR-0005/ADR-0006. Rejeitada; o atraso absoluto fica registrado no Apêndice A.5.

### Opção 3 — casa-version vira identidade do repo; docs-check sinaliza incoerência
**Prós:** a promessa volta a ser promessa; o aviso ganha função real (após atualizar a
toolchain, a declaração antiga permanece — o catch-up de contrato vira ato deliberado, com
CHANGELOG lido); local, determinístico, sem rede.
**Contras:** a versão de contrato passa a existir em duas constantes (casa-init e
docs-check) — duplicação guardada por teste de consistência no CI do casa-standard.

## Decisão

Opção 3, em duas partes:

1. **`casa-init`**: em router existente, atualiza só `casa-standard-ref` (propriedade da
   ferramenta); `casa-version` é **inserida apenas se ausente** (bootstrap de campo
   obrigatório, com o contrato vigente) e **nunca alterada** — é identidade do repo, como o
   resto do router (SPEC-0001, caso de borda 13).
2. **`docs-check`**: ganha a constante `CONTRACT_VERSION` (a versão de contrato que esta
   toolchain implementa) e compara com a declaração do router por `(major, minor)`:
   declaração **menor** → aviso de contrato atrás ("leia o CHANGELOG e atualize a
   declaração quando o repo cumprir o contrato novo"); declaração **maior** → aviso de
   toolchain atrás ("rode `casa-init` de um snapshot atual"). **Aviso, nunca erro** —
   mudança compatível não quebra gate de adotante (§10). `casa-version` malformada continua
   sendo o erro de formato existente; o aviso não dispara por cima.

Sintoma que promove o aviso a erro (disciplina do Apêndice A aplicada à severidade): um
adotante operar **≥2 minors atrás por mais de uma release** e disso resultar migração
custosa ou incidente de contrato — aí o aviso de contrato-atrás vira erro, por ADR novo.

## Consequências

- Primeira execução do `casa-init` ≥1.4 num repo antigo atualiza a toolchain e **deixa a
  declaração como está** — o aviso aparece no gate seguinte e o catch-up é decidido por
  quem leu o CHANGELOG. O carimbo automático deixa de mascarar contrato não-verificado.
- Downgrade silencioso de promessa (rodar casa-init de snapshot velho) deixa de existir.
- **Fora do alcance** de qualquer check local: repo que nunca roda `casa-init` nem tem gate
  (o estado real do console-platon hoje). Registrado como A.5 no Apêndice — cadência de
  atualização de adotantes é processo, não gate.
- Todo bump de contrato passa a tocar as duas constantes; o teste de consistência
  (test-casa-init) transforma esquecimento em CI vermelho no próprio casa-standard.

## Confirmação

```bash
bash scripts/test-casa-init     # exit 0: promessa preservada + constantes sincronizadas
bash scripts/test-docs-check    # exit 0: cenários dos avisos (SPEC-0006) verdes
python3 scripts/docs-check      # exit 0: o próprio repo segue verde
```

## Notas

Gatilho: issue #15 + revisão adversarial de 2026-07-05 (três revisores independentes; o
cético reproduziu o eco em sandbox). Comportamento detalhado: SPEC-0006 (avisos) e
SPEC-0001 (lado casa-init, evoluída neste PR).
