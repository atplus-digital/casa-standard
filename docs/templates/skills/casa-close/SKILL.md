---
name: casa-close
description: Faz o fechamento atômico de uma Spec CASA num único commit — status implemented, implemented-by com paths reais, Verificação com a evidência do DoD, gotchas no router, estado atual no capítulo de contexto, supersessão de ADR e índices regenerados. Use quando o DoD estiver verde e a entrega pronta para o PR final.
---

# CASA · fechar

Etapa 6 do ciclo (STANDARD §9 do casa-standard). Pré-requisito: DoD verde e `casa-verify`
sem ❌ — ou com a pendência aceita por um humano.

Tudo no **mesmo commit**:

1. **Spec:** `status: implemented`; `implemented-by` com os paths reais (código,
   migrations, testes); `## Verificação` com data, comando e resultado de cada linha do DoD
   — evidência, não "ok".
2. **Gotchas** não-inferíveis → `## Gotchas` do `AGENTS.md`, curtos. O router tem teto de
   ~150 linhas: estourou, o conteúdo desce para um capítulo e o router fica com o ponteiro.
3. **Estado atual** que mudou → capítulo de `docs/context/` apontado pelo Mapa: imperativo,
   atemporal, apontando para o ADR em vez de copiá-lo.
4. **ADR que esta entrega substitui:** no frontmatter, `status: superseded` e
   `superseded-by`; no topo do corpo, o bloco `> ⚠️ VERDADE ATUAL:` com até 3 linhas. O
   resto do corpo de um ADR aceito **nunca** muda.
5. `python3 scripts/docs-check --emit-index` e depois `python3 scripts/docs-check` → 0 erro.

Parte do escopo não ficou pronta? Não feche como `implemented`: divida a Spec ou mova o
resto para `## Fora do escopo` mais backlog (casa-standard:ADR-0012).
