---
status: implemented
date: 2026-07-06
builds-on: [ADR-0016, ADR-0010, ADR-0006]
implemented-by:
  - scripts/casa-update-check
  - scripts/test-update-check
  - docs/templates/casa-update-check.workflow.yml
  - scripts/casa-init
---

# casa-update-check mantém no tracker o aviso de contrato CASA desatualizado

## Objetivo

Um repo adotante com remote GitHub descobre sozinho, semanalmente, que o contrato CASA que
declara ficou atrás do vigente — como **uma issue acionável** no próprio tracker, que
nunca duplica e fecha sozinha quando o repo alcança. Nada disso toca o gate.

## Fluxo

1. O workflow agendado (`casa-update-check.yml`: cron semanal + `workflow_dispatch`) roda
   `sh scripts/casa-update-check` com o `GITHUB_TOKEN` do repo (`issues: write`).
2. O script lê `casa-version` do `AGENTS.md` e a versão vigente da primeira entrada
   `## CASA X.Y` do `CHANGELOG.md` raw do casa-standard (URL sobrescrevível por
   `CASA_SOURCE_URL` — teste e fork).
3. Compara (ordem de versão): **atrás** → garante a label `casa-update` e cria a issue de
   aviso, ou **edita** a já aberta (título e corpo com as versões atuais). **Em dia / à
   frente** → fecha, com comentário, qualquer issue `casa-update` aberta.
4. Corpo da issue: rodar `casa-init` (ou `install.sh`), ler o CHANGELOG entre as versões e
   atualizar a declaração quando o repo cumprir (ADR-0010).

## Contrato

- **Exit 0 sempre** que o mundo externo falhar: rede indisponível, CHANGELOG ilegível,
  `casa-version` ausente/ilegível — loga e sai; integridade do router é papel do
  `docs-check`, e um job agendado nunca vira vermelho que assusta.
- Exit ≠ 0 só por erro de uso (root inexistente).
- No máximo **uma** issue `casa-update` aberta por repo.
- Instalação (casa-init): remote GitHub → workflow criado se ausente, preservado se
  existir; sem remote GitHub → não instalado (A.5). O template é toolchain
  (atualizável em `docs/templates/`); o workflow instalado é do repo.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | contrato declarado atrás do vigente | criar issue com label `casa-update` (título com as duas versões) |
| 2 | já existe issue `casa-update` aberta | editá-la — nunca duplicar |
| 3 | declarado em dia com o vigente | não criar nada e fechar issue `casa-update` aberta, se houver |
| 4 | declarado à frente do vigente | tratar como em dia (julgar não é papel do job) |
| 5 | rede/URL da fonte indisponível | exit 0 com log — nunca falhar o job |
| 6 | `casa-version` ilegível no router | exit 0 com log — quem cobra o router é o docs-check |
| 7 | destino sem remote GitHub | workflow nem instalado (casa-init, ADR-0006/0016) |
| 8 | workflow já existe no destino | casa-init preserva (workflow é do repo) |

## Questões em aberto

(nenhuma — spec chega decidida)

## Definition of Done

```bash
bash scripts/test-update-check   # exit 0 — casos 1–6 com stubs de curl/gh verdes
bash scripts/test-casa-init      # exit 0 — casos 7–8 (instalação por host) verdes
python3 scripts/docs-check       # exit 0 — o próprio repo segue verde
```

## Revisão humana

- Texto da issue gerada: acionável para quem nunca leu os ADRs (diz o quê e em que ordem).
- Cadência do cron (semanal, horário deslocado) razoável para a frota.

## Verificação

```text
2026-07-06 · bash scripts/test-update-check → 11 PASS / 0 FAIL (SPEC-0008 casos 1–6 com stubs), exit 0
2026-07-06 · bash scripts/test-casa-init → 33 PASS / 0 FAIL (casos 7–8: workflow por host), exit 0
2026-07-06 · python3 scripts/docs-check → 23 docs · 0 erro(s) · 0 aviso(s), exit 0
```
