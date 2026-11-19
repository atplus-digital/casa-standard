---
status: implemented
date: 2026-11-18
builds-on: [ADR-0017, ADR-0004, ADR-0009]
implemented-by:
  - scripts/casa-init
  - scripts/test-casa-init
  - docs/templates/skills/casa-explore/SKILL.md
  - docs/templates/skills/casa-propose/SKILL.md
  - docs/templates/skills/casa-apply/SKILL.md
  - docs/templates/skills/casa-verify/SKILL.md
  - docs/templates/skills/casa-close/SKILL.md
---

# casa-init distribui as skills casa-* do ciclo de entrega

## Objetivo

Todo repo T1 bootstrapped ou atualizado pelo `casa-init` passa a ter o ciclo do §9 como
skills executáveis pelo agente (`casa-explore`, `casa-propose`, `casa-apply`,
`casa-verify`, `casa-close`), no formato aberto Agent Skills, visíveis tanto para clientes
que seguem a convenção `.agents/skills/` quanto para o Claude Code (ADR-0017).

## Fluxo

1. A fonte única das skills é `docs/templates/skills/<nome>/SKILL.md` no casa-standard.
2. O `casa-init` lê o tier do router (com fallback para `--tier` em router legado sem a
   chave); em T1, renderiza e copia cada skill para `.agents/skills/<nome>/` e
   `.claude/skills/<nome>/` do destino — cria, atualiza se divergir, ou relata "em dia". Em
   T0, não instala e remove skills `casa-*` nossas caso existam de execução anterior.
3. O agente do adotante descobre as skills pela descrição; o usuário as invoca pelo nome.

## Contrato

- Frontmatter só com campos portáveis (`name`, `description`); `name` igual ao diretório.
- Skills `casa-*` são da toolchain; outros nomes nos diretórios de skill são do repo.
- O link do STANDARD nas skills segue o snapshot da toolchain (`casa-standard-ref`), mantendo
  `blob/main/` quando `ref` é `local`/`unknown`; o `STANDARD.md` não é copiado para o
  adotante.
- Nada no `docs-check` muda: skill não é gate (ADR-0017).

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | `casa-init` num repo T1 | instalar as cinco skills em `.agents/skills/` e em `.claude/skills/` |
| 2 | skills instaladas | ser byte a byte iguais entre os dois diretórios e ao template renderizado (LF preservado) |
| 3 | template de skill no casa-standard | ter frontmatter Agent Skills válido e portável (duas linhas, nome = diretório, descrição de 1 a 1024 caracteres, sem `<`/`>`) |
| 4 | skill cita `scripts/…` | o script existir na toolchain instalada no destino |
| 5 | `casa-*` editada no adotante / skill do repo com outro nome | voltar ao template, relatando "atualizado" / ficar intocada |
| 6 | `casa-init` num repo T0 (novo, legado com `--tier T0`, `casa-tier` entre aspas ou migrado de T1) | não instalar skills (e remover `casa-*` nossas se existirem), relatando o motivo |
| 7 | segunda execução sem mudança | não alterar nenhum byte (idempotência, EARS-10 da SPEC-0001) |
| 8 | skill instalada com ref git / com ref `local` ou `unknown` | apontar o `STANDARD.md` no `casa-standard-ref` carimbado no router / manter `blob/main/` |
| 9 | `.claude` é arquivo | avisar, sem traceback; gate e `.agents/skills/` instalados mesmo assim |
| 10 | diretório de skills no `.gitignore` | avisar que as skills ficam só nesta máquina |
| 11 | skill na lista de aposentadas / homônima (válida ou não-UTF-8) que não é nossa | remover pelo marcador CASA / preservar sem erro |
| 12 | template de skill cita `§N` ou `§N.M` | a seção ou subseção existir no `STANDARD.md` |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
scripts/test-casa-init        # exit 0 — casos 1–6 e 8–12 (SPEC-0010/N) e 7 (EARS-10)
python3 scripts/docs-check    # exit 0 — o próprio repo segue verde
```

## Revisão humana

- As descrições disparam a skill certa nos agentes usados na atplus (Claude Code, Codex,
  Cursor) sem disparar à toa?
- O texto de cada skill cabe no que o STANDARD já diz, sem regra nova escondida?

## Verificação

```text
2026-11-18 · Python 3.11.2, git 2.39.5
scripts/test-casa-init        → 72 PASS / 0 FAIL, exit 0 (SPEC-0010 casos 1–12 + regressões SPEC-0001/0005/0008/0009)
python3 scripts/docs-check    → 26 docs · 0 erro(s) · 0 aviso(s), exit 0 (--check-adr-immutability --base-ref origin/main)
bash scripts/test-docs-check  → 52 PASS / 0 FAIL · scripts/test-docs-reserve → 23 PASS / 0 FAIL · scripts/test-update-check → 14 PASS / 0 FAIL · scripts/test-install → 13 PASS / 0 FAIL
```
