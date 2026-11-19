---
name: casa-explore
description: Mapeia o contexto CASA antes de mexer no código — router AGENTS.md, capítulos do Mapa de contexto, ADRs e Specs da área (docs/index.json) e o código afetado — e diz se a tarefa pede ADR, Spec ou nada. Use ao começar uma tarefa não-trivial, investigar um problema ou antes de propor mudança num repo que segue o CASA Standard.
---

# CASA · explorar

Etapa 4 do ciclo — §9 do [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (na versão da toolchain instalada). Objetivo: entender o **porquê** antes do
**o quê**. Não edite nada nesta etapa.

1. Leia o `AGENTS.md` (router): DoD global, gotchas e o Mapa de contexto.
2. Carregue só os capítulos de `docs/context/` cuja coluna "Quando carregar" casa com a
   tarefa. Capítulo é estado atual; decisão datada é ADR.
3. Ache o subgrafo: em `docs/index.json` (ou nos `README.md` gerados de `docs/adr/` e
   `docs/specs/`), selecione os ADRs e Specs da área pelo título e siga `builds-on` a
   montante. ADR `superseded`: leia o bloco `VERDADE ATUAL` do topo e vá para o ADR de
   `superseded-by`.
4. Leia o código que a tarefa toca e os testes dele.
5. Entregue um resumo curto:
   - decisões vigentes que restringem a tarefa (ADR-NNNN + uma linha cada);
   - comportamento contratado (SPEC-NNNN, status, casos de borda que a tarefa toca);
   - gatilho (§3): decisão estrutural → ADR; contrato observável → Spec; nenhum → só código;
   - o que o repo não responde → pergunte. Não invente.

Decisão de negócio ainda não tomada não vira ADR: vai para o issue tracker — ou, em repo sem
tracker, para `docs/BACKLOG.md` (§5.1).
