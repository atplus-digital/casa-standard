---
status: implemented
date: 2026-06-09
builds-on: [ADR-0005, ADR-0004]
implemented-by:
  - install.sh
  - scripts/test-install
  - scripts/casa-init
  - .github/workflows/docs-check.yml
---

# install.sh faz o bootstrap CASA via curl|sh sem clone e sem segunda fonte da verdade

> Convenções compartilhadas: este repo não tem `docs/context/CONVENTIONS.md`; o contrato
> de propriedade (toolchain × identidade × conteúdo) é o da SPEC-0001 e não se repete aqui.

## Objetivo

Quem quiser aplicar o CASA roda **um comando, sem clonar nada**:

```bash
curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh -s -- <destino> [--repo-id NOME] [--tier T0|T1]
```

O script baixa o tarball do casa-standard (ref pinável), extrai num temporário e executa o
`scripts/casa-init` de lá — toda a semântica de bootstrap continua na SPEC-0001; esta spec
cobre só o transporte.

## Fluxo

1. Valida pré-requisitos (`python3`, `tar`; `curl` só quando vai baixar) — falha clara
   **antes** de baixar ou escrever qualquer coisa.
2. Resolve origem: `CASA_TARBALL` (tarball local, sem rede) ou download de
   `codeload.github.com/<repo>/tar.gz/<ref>` (`CASA_REF`, default `main`).
3. Extrai em `mktemp -d` (removido por `trap` em qualquer término) e detecta a raiz —
   tarball do codeload tem diretório-prefixo; tarball plano não.
4. Resolve o carimbo: ref pinado, ou sha curto de `main` via `git ls-remote` quando
   disponível; exporta `CASA_STANDARD_REF` e executa o `casa-init` com os argumentos
   repassados intactos (sem argumentos ou só flags → destino é o diretório corrente).

## Contrato

- Corpo inteiro em `main()`, invocada na última linha (`main "$@"`) — download truncado
  não executa nada.
- Escreve apenas no `mktemp` e no destino (via casa-init); sem sudo, sem `$HOME`.
- POSIX sh (sem bashismos); exit ≠ 0 com mensagem `casa-install: ...` em qualquer falha.
- Variáveis de ambiente: `CASA_REF` (ref a baixar/carimbar), `CASA_REPO` (override do
  repo), `CASA_TARBALL` (origem local; carimbo vira `CASA_REF` ou `local`).

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | executado sem argumentos | aplicar o casa-init no diretório corrente |
| 2 | executado com destino e flags | repassá-los intactos ao casa-init |
| 3 | executado só com flags (sem destino) | assumir o diretório corrente como destino |
| 4 | `python3` indisponível | falhar com mensagem clara antes de baixar e sem escrever nada |
| 5 | download truncado/interrompido | não executar nada (proteção estrutural do `main()`) |
| 6 | `CASA_REF` aponta tag/sha | baixar esse ref e carimbá-lo no router do destino |
| 7 | `CASA_TARBALL` aponta tarball local | usar o tarball sem tocar a rede |
| 8 | tarball com diretório-prefixo (codeload) ou plano | detectar a raiz em ambos os formatos |
| 9 | término por sucesso, falha ou interrupção | remover o diretório temporário (`trap`) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
scripts/test-install          # exit 0 — cenários acima verdes, sem rede
python3 scripts/docs-check    # exit 0 — o próprio repo segue verde
```

## Revisão humana

- Postura de segurança do curl|sh: o script continua auditável em ~30s? Escopo de escrita
  continua mktemp+destino?
- EARS-9 (`trap` remove o temporário) é verificado por leitura — não há assert automatizado.
- O README mantém o caminho de duas etapas (baixar, ler, rodar) para quem não confia no pipe.

## Verificação

```text
2026-06-09 · scripts/test-install → 11 PASS / 0 FAIL (EARS 1–8 cobertos; EARS-9 por leitura), exit 0
2026-06-09 · scripts/test-casa-init → 16 PASS / 0 FAIL (regressão SPEC-0001), exit 0
2026-06-09 · python3 scripts/docs-check → 7 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-06-13 · bash scripts/test-install → 11 PASS / 0 FAIL (regressão com CASA 1.1), exit 0
```
