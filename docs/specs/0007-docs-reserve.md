---
status: implemented
date: 2026-07-05
builds-on: [ADR-0013, ADR-0002, ADR-0011]
implemented-by:
  - scripts/docs-reserve
  - scripts/test-docs-reserve
  - scripts/casa-init
---

# docs-reserve reserva o próximo NNNN e cria o documento do template

## Objetivo

Reservar número e criar ADR/Spec vira uma operação de um comando — número sequencial
calculado do estado real (árvore completa da camada + ledger), arquivo nascido do
template com data e H1 certos, reserva registrada — eliminando o erro manual que gera
colisão e renumeração (issue #12).

## Fluxo

```bash
scripts/docs-reserve adr  "título da decisão"        [--dry-run] [--no-emit-index]
scripts/docs-reserve spec "título do comportamento"  [--dry-run] [--no-emit-index]
```

1. Recusa operar se o backlog está em `docs/context/` e não há `docs/BACKLOG.md` (ADR-0011).
2. Coleta números usados: arquivos `NNNN-*.md` da camada em toda a árvore + rows da seção correspondente do
   ledger (`## Reservas ADR` / `## Reservas Spec`); linha ilegível da seção é APONTADA.
3. Próximo = max+1; lacunas são anotadas (nunca reutilizadas).
4. Cria `docs/<camada>/**/NNNN-slug.md` do template do repo: `date` de hoje, H1 = título,
   status default do template (`proposed`/`draft`), usando `--dir` quando fornecido.
5. Registra `| NNNN | título | data | em uso |` na tabela da seção (cria ledger/seção se
   ausentes) e regenera os índices via `docs-check --emit-index` (salvo `--no-emit-index`).

## Contrato

- Saída: `Reserved <ID>` + `Created <path>` + `Updated docs/BACKLOG.md` + instrução de
  rodar o `docs-check` (que segue sendo a única autoridade de validação — ADR-0002).
- Nunca sobrescreve arquivo; exit ≠ 0 só por erro de uso (camada inválida, título sem slug,
  template ausente, backlog no lugar errado, `--dir` inválido).
- Parser da tabela: primeira célula `NNNN` ou `ADR-NNNN`/`SPEC-NNNN`; demais células são
  livres. Linha da seção fora disso → AVISO com a linha citada, operação continua.
- `--dry-run` imprime número/arquivo/linha e não escreve **nada**.
- `--dir` é relativo à camada e permite escrever em subpastas sem alterar a sequência
  global da camada.
- Coordenação entre worktrees/branches paralelas: fora de escopo (ADR-0013) — a proteção é
  o conflito textual da tabela no merge.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | repo recém-bootstrapped, sem ledger | reservar 0001, criar o doc do template (data de hoje, H1 = título) e criar `docs/BACKLOG.md` com a tabela |
| 2 | reservas nas duas camadas | numerar cada camada de forma independente e sequencial, mesmo com subpastas |
| 3 | row manual na tabela com número acima do max de arquivos | respeitá-la (`max(arquivos, reservas)+1`) e anotar lacunas |
| 3b | row no formato de campo com prefixo (`ADR-0004`) | contar normalmente (compat com ledgers existentes) |
| 3c | arquivo já existe em subpasta da camada | contar o número dele e manter a sequência global contínua |
| 4 | linha ilegível dentro da seção de reservas | emitir AVISO citando a linha e continuar — nunca ler em silêncio |
| 5 | backlog em `docs/context/` sem `docs/BACKLOG.md` | recusar com erro citando o ADR-0011 e não escrever nada |
| 6 | título com acentos/pontuação | slug ASCII kebab-case por transliteração |
| 7 | `--dry-run` | anunciar número/arquivo/linha sem escrever nada |
| 7b | `--dir` aponta para uma subpasta válida | criar o arquivo nessa subpasta sem reiniciar a numeração |
| 8 | título que translitera para slug vazio | falhar com erro claro |
| 9 | reserva concluída | repo passa `docs-check` (índices regenerados automaticamente) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-docs-reserve   # exit 0 — casos 1–9 acima verdes
python3 scripts/docs-check       # exit 0 — o próprio repo segue verde
```

## Revisão humana

- Mensagens de erro/aviso acionáveis para quem nunca leu ADR-0013 (dizem o que fazer).
- O ledger migrado deste repo continua legível para humanos.

## Verificação

```text
2026-07-05 · bash scripts/test-docs-reserve → 19 PASS / 0 FAIL (SPEC-0007 casos 1–9 + 3b), exit 0
2026-07-05 · bash scripts/test-casa-init → 31 PASS / 0 FAIL (docs-reserve na TOOLCHAIN; idempotência intacta), exit 0
2026-07-05 · python3 scripts/docs-check → 20 docs · 0 erro(s) · 0 aviso(s), exit 0
```
