---
status: accepted
date: 2026-06-09
builds-on: [ADR-0004]
superseded-by: null
deciders: [maicon]
---

# Distribuição do bootstrap é buscador fino via curl|sh no próprio repo

## Contexto e problema

O ADR-0004 criou o `casa-init`, mas o transporte ainda era "clone o casa-standard e rode o
script" — duas etapas e um clone descartável. Avaliou-se npm (`npm create casa`) e um
script shell auto-contido. O npm está bloqueado por credencial (nenhum login npm na
máquina, org inexistente no registry, nome `casa` squatted — contornável via `create-casa`,
mas exige conta, token de CI e 2FA para manter). O repo já é público no GitHub: a
infraestrutura de distribuição via URL já existe sem custo novo.

## Direcionadores da decisão

- Um fato mora num arquivo só: o que chega no adotante deve vir do estado canônico do repo.
- Zero dependência nova de infraestrutura (conta, token, pipeline de publish).
- `curl | sh` tem má fama merecida — o script precisa ser auditável, pinável e à prova de
  download truncado, ou não sai.
- O mecanismo de carimbo de versão deve servir igualmente a um canal npm futuro.

## Opções consideradas

### Opção 1 — npm (`create-casa`, via `npm create casa`)
**Prós:** registry com versionamento semântico; UX familiar para times JS.
**Contras:** bloqueado em credencial/org npm; pipeline de publish + token/2FA para manter;
artefato com lag em relação ao repo; nome `casa` squatted.

### Opção 2 — script auto-contido (toolchain embutida em heredocs/base64)
**Prós:** um arquivo; funciona offline.
**Contras:** é uma **cópia** da toolchain — segunda fonte da verdade, salvo regeneração por
CI a cada mudança; mesma classe de problema rejeitada no ADR-0004. Só se justifica em
ambiente air-gapped, que não é o caso.

### Opção 3 — buscador fino (`install.sh`) no próprio repo
**Prós:** não contém nada — baixa o tarball do repo no momento da execução (estado
canônico ou ref pinado); ~60 linhas auditáveis; zero infraestrutura nova; testável sem
rede via tarball local.
**Contras:** exige rede na execução (mitigado: `CASA_TARBALL` para uso offline/teste);
carrega o estigma do curl|sh (mitigado pelas regras abaixo).

## Decisão

Opção 3. `install.sh` na raiz do repo, executado via
`curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh`,
com quatro regras inegociáveis: (1) corpo inteiro em `main()`, chamada na última linha —
download truncado não executa nada; (2) escreve só em `mktemp` (removido por `trap`) e no
destino — sem sudo, sem `$HOME`, sem instalação global; (3) pinável por ref
(`CASA_REF=v1.0.0`); (4) sem teatro de segurança — checksum baixado da mesma origem do
script não verifica nada e fica de fora. O sha/ref baixado entra no `casa-init` via env
`CASA_STANDARD_REF` e vira o carimbo do router. Comportamento: SPEC-0002.

## Consequências

- Bootstrap vira um comando sem clone; atualização de toolchain idem (re-rodar).
- O `casa-init` ganha a precedência `CASA_STANDARD_REF` > git — o canal npm futuro, se
  vier, reutiliza o mecanismo (será `create-casa` publicado por CI; fica adiado, não
  descartado).
- O README ensina também o caminho de duas etapas (baixar, ler, rodar) para quem audita.
- O CI testa o instalador sem rede (`scripts/test-install`, tarballs locais).

## Confirmação

```bash
sh -n install.sh && [ "$(tail -1 install.sh)" = 'main "$@"' ]   # sintaxe ok + proteção anti-truncamento
```

## Notas

Gatilho: pergunta de distribuição ("npm install casa?"). npm avaliado e adiado nesta
decisão; se reaberto, nasce de ADR novo que supersede ou estende esta.
