---
status: implemented
date: 2026-11-18
builds-on: [ADR-0006, ADR-0007, ADR-0010, ADR-0013, ADR-0016]
implemented-by:
  - scripts/docs-check
  - scripts/pre-commit
  - scripts/casa-init
  - scripts/docs-reserve
  - scripts/casa-update-check
  - docs/templates/docs-check.workflow.yml
  - docs/templates/AGENTS.template.md
  - .github/workflows/docs-check.yml
  - scripts/test-docs-check
  - scripts/test-casa-init
  - scripts/test-docs-reserve
  - scripts/test-update-check
  - scripts/test-install
---

# Gate confiável: hook, CI e imutabilidade validam o que de fato entra

## Objetivo

O gate do CASA deixa de ficar verde com a garantia falsa. Auditoria de 2026-11-18 (revisão
interna + relatório consolidado CASA × atplus) reproduziu, em repos descartáveis, casos em
que o `docs-check`, o pre-commit, o workflow ou o `casa-init` aprovavam o que o STANDARD
proíbe — ou instalavam um gate que o git nunca executa. Esta spec fecha esses casos **sem
mudar o contrato** (CASA 1.8, ADR-0010): a toolchain passa a cumprir o que o §3/§5/§8 já
prometiam.

## Fluxo

1. `casa-init` instala o gate onde o git de fato o executa — ou não instala e explica.
2. No commit, o pre-commit valida o **index** (`docs-check --staged`).
3. No CI, o workflow compara com a base do evento (PR: branch de destino; push: commit
   anterior) e o lint de imutabilidade compara cada ADR imutável **pelo número**, contra a
   merge-base.
4. O `docs-check` aplica ao router e ao `TESTS.md` as mesmas regras de comentário e
   placeholder que já aplicava às specs.

## Contrato

- Nenhuma mudança em `casa-version`, formato de índice gerado ou flags existentes; flag nova:
  `--staged` (não combina com `--emit-index`/`--check-adr-immutability`).
- Erros novos só onde o STANDARD já proibia (chave duplicada, ponteiro quebrado, corpo de
  ADR alterado por rename/exclusão/status). Aviso novo: DoD global igual ao exemplo `npm` do
  template antigo.
- Workflow existente no adotante nunca é sobrescrito; divergência do template vira AVISO.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | `casa-init` cria o router | pôr `python3 scripts/docs-check` no DoD global, nunca comando de exemplo |
| 2 | DoD global é o exemplo `npm` do template antigo | avisar (exit 0) para trocar pelos comandos reais |
| 3 | DoD global ou `TESTS.md` declarado só tem comando dentro de comentário HTML | falhar |
| 4 | DoD tem `<placeholder>` solto / `<Tag>` entre aspas ou redireção `<in >out` | falhar / passar |
| 5 | Mapa de contexto aponta capítulo inexistente via link markdown | falhar como no ponteiro entre crases |
| 6 | frontmatter com chave duplicada, `status: ""` ou `status: [x]` | falhar com mensagem; nunca traceback (inclusive `--warn-only`) |
| 7 | `builds-on` aponta para o próprio doc | falhar |
| 8 | ADR imutável renomeado com corpo alterado / sem alteração | falhar citando o path antigo / passar |
| 9 | ADR imutável removido | falhar |
| 10 | status de ADR imutável regride (`accepted` → `proposed`) | falhar |
| 11 | citação `VERDADE ATUAL` no meio do corpo, ou com mais de 3 linhas | tratar como corpo (falhar) |
| 12 | branch atrás da base, que ganhou ADR aceito novo | passar — comparação contra a merge-base |
| 13 | `.DS_Store` ignorado pelo `.gitignore` / duplicado `x 2.md` não ignorado | passar / falhar |
| 14 | doc inválido no index, corrigido só no disco / válido no index, quebrado no disco | `--staged` falha / passa |
| 15 | repo com `core.hooksPath` | instalar o hook no diretório configurado |
| 16 | `casa-init` num worktree | hook no diretório comum, como cópia; checkout sem toolchain não é bloqueado |
| 17 | destino é subpasta de outro repo | não instalar gate no repo pai; avisar; o pai segue commitando |
| 18 | remote GitHub com branch padrão `master`; workflow existente divergente | `branches: [master]`, base do evento, nota de check obrigatório; AVISO sem sobrescrever |
| 19 | `docs-reserve spec` | título no H1 do corpo; comentário do frontmatter intacto (restaura a SPEC-0007) |
| 20 | `casa-update-check` não consegue consultar issues / é chamado de outro diretório | não criar issue às cegas, logar, exit 0 / operar no root informado |
| 21 | instalação pinada via pipe | documentação passa `CASA_REF` ao `sh`, não ao `curl` |

## Fora do escopo

- Exigir `## Confirmação` em ADR aceito, ciclo em `builds-on`, `|` em títulos no README
  gerado (mudaria o índice de todos os adotantes) — registrados para decisão própria.
- Janela de adoção com ratchet (issue #19): decisão separada.
- Tornar o check obrigatório na proteção de branch um requisito formal do T1 (mudança de
  contrato → ADR); aqui o `casa-init` só orienta.

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-docs-check    # exit 0 — casos 2–14
scripts/test-casa-init          # exit 0 — casos 1, 15–18
scripts/test-docs-reserve       # exit 0 — caso 19
scripts/test-update-check       # exit 0 — caso 20
scripts/test-install            # exit 0 — caso 21
python3 scripts/docs-check      # exit 0 — o próprio repo segue verde
```

## Revisão humana

- As mensagens novas (rename, regressão de status, `--staged`) bastam para o adotante
  corrigir sem ler o código?
- O AVISO de workflow divergente é útil ou vira ruído em adotante que customizou o arquivo?

## Verificação

```text
2026-11-18 · Python 3.13.18, git 2.43.0
bash scripts/test-docs-check  → 42 PASS / 0 FAIL, exit 0 (casos 2–14; 17 deles falham na main 551e1ea)
scripts/test-casa-init        → 46 PASS / 0 FAIL, exit 0 (casos 1, 15–18; 11 falham na main)
scripts/test-docs-reserve     → 23 PASS / 0 FAIL, exit 0 (caso 19; 3 falham na main)
scripts/test-update-check     → 14 PASS / 0 FAIL, exit 0 (caso 20; 3 falham na main)
scripts/test-install          → 13 PASS / 0 FAIL, exit 0 (caso 21; 2 falham na main)
python3 scripts/docs-check    → 24 docs · 0 erro(s) · 0 aviso(s), exit 0
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main → 0 erro(s), exit 0
```
