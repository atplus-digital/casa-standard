---
status: implemented
date: 2026-07-31
builds-on: [ADR-0017, SPEC-0003]
implemented-by: [scripts/docs-check, scripts/test-docs-check, scripts/casa-init, STANDARD.md]
---

# docs-check limita a janela de adoção por baseline monotônica

## Objetivo

Permitir migração incremental sem deixar o gate aceitar regressões: erros já registrados
podem permanecer, erros novos falham e cada correção reduz permanentemente o teto.

## Fluxo

1. Em uma branch sobre a base de integração, executar
   `python3 scripts/docs-check --adoption --emit-baseline --base-ref origin/main`.
2. Commitar `docs/.docs-check-baseline.json` e trocar temporariamente o gate para
   `python3 scripts/docs-check --adoption --base-ref origin/main`.
3. Estado idêntico passa; regressão falha; progresso pede nova emissão no mesmo PR.
4. Ao chegar a zero, remover baseline e `--adoption`; o comando estrito volta a ser o gate.

## Contrato

- Path fixo: `docs/.docs-check-baseline.json`, propriedade do repo adotante.
- JSON canônico: `schema: 1`, `diagnostic-format: 1`, `errors: [...]`; lista não vazia,
  duplicatas preservadas e ordem lexicográfica por bytes UTF-8.
- Identidade v1: mensagem completa, com `\\` normalizada para `/`, root absoluto removido e
  `frontmatter linha N` normalizado para `frontmatter linha <n>`.
- `--adoption` exige `--base-ref` resolvível em Git. Baseline nova é aceita somente se a
  base não tinha arquivo, ainda declara CASA 1.x e os erros atuais são multissubconjunto dos
  diagnósticos obtidos ao revalidar seu snapshot; base 2.x sem arquivo encerrou a janela.
  Baseline existente só pode ser multissubconjunto da base.
- `--warn-only` é alias depreciado de `--adoption`; não existe mais bypass incondicional.
- `--emit-baseline` exige modo de adoção, não combina com `--emit-index`, não escreve com
  zero erros e nunca incorpora erro fora do teto já versionado.
- O snapshot da primeira captura precisa materializar exatamente os paths e OIDs de
  `git ls-tree`; `export-ignore`, `export-subst`, filtros, symlink ou submódulo falham
  fechados.
- Avisos não entram na baseline.

## Casos de borda

| # | QUANDO ⟨gatilho⟩ | o sistema DEVE ⟨resposta⟩ |
|---|---|---|
| 1 | modo de adoção roda sem baseline | falhar e imprimir o comando exato de captura |
| 2 | primeira captura tem apenas erros já presentes na base CASA 1.x e snapshot íntegro | criar JSON canônico; erro novo ou árvore materializada divergente falha sem escrever |
| 3 | erros atuais são idênticos à baseline | sair 0 e manter o teto |
| 4 | surge erro fora da baseline | falhar e listar cada erro novo |
| 5 | um erro legado é resolvido | falhar com boa notícia e mandar emitir o teto menor |
| 6 | emissão reduzir o multiconjunto | atualizar a baseline e sair 0 |
| 7 | emissão não altera o multiconjunto | ser no-op idempotente e sair 0 |
| 8 | erros chegam a zero com baseline/modo de adoção | falhar orientando encerrar a janela; não emitir baseline vazia |
| 9 | gate estrito chega a zero mas a baseline permanece | falhar cobrando a remoção residual |
| 10 | baseline é apagada/editada para aceitar erro novo, ou reintroduzida sobre base CASA 2.x | falhar; teto de PR nunca cresce e janela encerrada não reabre |
| 11 | JSON é malformado, vazio, não canônico ou de versão desconhecida | falhar com diagnóstico específico, sem sobrescrever |
| 12 | o mesmo erro ocorre duas vezes | preservar multiplicidade; resolver uma ocorrência reduz o teto em uma |
| 13 | `--warn-only` é usado | aplicar o ratchet e avisar que o alias foi depreciado |

## Questões em aberto

(nenhuma — spec decidida)

## Definition of Done

```bash
bash scripts/test-docs-check   # casos 1–13 verdes
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main   # exit 0
bash scripts/test-casa-init    # constantes CASA 2.0 sincronizadas
```

## Revisão humana

- Confirmar que a mensagem de progresso é positiva e copiável, sem ensinar a apagar a
  baseline para contornar o teto.
- Confirmar que a nota de migração torna explícita a quebra do `--warn-only` antigo.

## Verificação

```text
2026-07-31
- bash scripts/test-docs-check: 50 PASS / 0 FAIL (13 cenários SPEC-0009 + guardas adversariais)
- bash scripts/test-casa-init: 33 PASS / 0 FAIL
- bash scripts/test-docs-reserve: 19 PASS / 0 FAIL
- bash scripts/test-update-check: 11 PASS / 0 FAIL
- bash scripts/test-install: 11 PASS / 0 FAIL
- python3 scripts/docs-check --check-adr-immutability --base-ref origin/main: exit 0
```
