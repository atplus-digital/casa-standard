---
status: implemented
date: 2026-06-09
builds-on: [ADR-0004, ADR-0001, ADR-0006]
implemented-by:
  - scripts/casa-init
  - scripts/test-casa-init
  - docs/templates/docs-check.workflow.yml
  - docs/templates/AGENTS.template.md
  - .github/workflows/docs-check.yml
---

# casa-init instala e atualiza a infraestrutura CASA em qualquer estado de repo

## Objetivo

Quem quiser aplicar o CASA num repo — vazio, novo, legado, com docs ADR/SDD pré-existentes —
roda um comando e recebe a infraestrutura completa (validador, templates, router se ausente,
gate do §3) sem que nada do conteúdo dele seja tocado. Rodar de novo atualiza a toolchain
(é também o mecanismo de atualização dos repos já adotados).

## Fluxo

```bash
scripts/casa-init <destino> [--repo-id NOME] [--tier T0|T1]
```

1. Resolve o destino (cria o diretório se não existir), o `casa-version` do contrato e o
   `casa-standard-ref` (sha curto da origem).
2. Copia a **toolchain** (propriedade da ferramenta): `scripts/docs-check`,
   `scripts/pre-commit`, `docs/templates/*` — cria, atualiza se difere, ou relata "em dia".
3. Trata a **identidade** (propriedade do repo): `AGENTS.md` é instanciado do template só
   se ausente (repo-id, tier, versão e ref carimbados); se existir, só `casa-version` e
   `casa-standard-ref` são atualizados/inseridos no bloco `yaml` quando possível.
4. Instala o **gate** (ADR-0006): remote GitHub → workflow de CI (de
   `docs/templates/docs-check.workflow.yml`, criado se ausente); sem remote ou remote
   de host sem adaptador de CI → pre-commit hook (symlink para `scripts/pre-commit`),
   com AVISO quando há remote; sem `.git` → orienta.
5. **Diagnostica**: roda o `docs-check` do destino e relata — migração de conteúdo é
   trabalho humano (§10), não deste script.

## Contrato

- Saída por linha: `criado | atualizado | em dia | preservado | AVISO` + caminho/motivo.
- Exit 0 = instalação concluída; pendência de migração de docs é relatório, não falha.
- Exit ≠ 0 só por erro de uso (destino inválido, destino = casa-standard).
- **Nunca toca**: `docs/adr|specs|context`, `README`, `LICENSE`, código, router existente
  (exceto `casa-version` e `casa-standard-ref`, que pertencem à ferramenta).

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | o destino não existe | criá-lo e seguir como repo novo |
| 2 | o destino é o próprio casa-standard | abortar com erro e exit ≠ 0 |
| 3 | `AGENTS.md` já existe no destino | preservá-lo; atualizar/inserir só `casa-version` e `casa-standard-ref` no bloco `yaml`, se houver |
| 4 | um arquivo de toolchain difere da origem | sobrescrevê-lo e relatar "atualizado" |
| 5 | não há `.git` no destino | não instalar gate e orientar a rodar de novo após `git init` |
| 6 | há `.git` sem remote | instalar o pre-commit hook (ADR-0006) |
| 7 | há `.git` com remote do GitHub | criar o workflow de CI se ausente; hook não é instalado |
| 8 | `.git/hooks/pre-commit` existe e não é o do CASA | não tocá-lo e emitir AVISO |
| 9 | o `docs-check` falha no destino pós-instalação | manter exit 0 e relatar a migração pendente (§10) |
| 10 | rodado duas vezes seguidas sem mudança na origem | a segunda execução não altera nenhum byte |
| 11 | `--repo-id` ausente | derivar do basename do destino |
| 12 | há `.git` com remote de host sem adaptador de CI (ex.: GitLab) | instalar o pre-commit hook e emitir AVISO orientando a integrar o `docs-check` ao CI do host (ADR-0006) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
scripts/test-casa-init        # exit 0 — todos os cenários acima verdes
python3 scripts/docs-check    # exit 0 — o próprio repo segue verde
```

## Revisão humana

- Clareza das mensagens de saída para quem nunca viu o CASA.
- A decisão de migrar conteúdo legado (status, frontmatter, dedup) continua humana — o
  script só diagnostica; conferir que ele nunca cruza essa linha.

## Verificação

```text
2026-06-09 · scripts/test-casa-init → 16 PASS / 0 FAIL (EARS 1–11 cobertos), exit 0
2026-06-09 · python3 scripts/docs-check → 5 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-06-12 · scripts/test-casa-init → 19 PASS / 0 FAIL (EARS 1–12 cobertos; gate por host, ADR-0006), exit 0
2026-06-12 · python3 scripts/docs-check → 8 docs · 0 erro(s) · 0 aviso(s), exit 0
2026-06-13 · bash scripts/test-casa-init → 23 PASS / 0 FAIL (casa-version + regressões), exit 0
2026-06-13 · python3 scripts/docs-check → 10 docs · 0 erro(s) · 0 aviso(s), exit 0
```
