---
name: casa-verify
description: Revisa se a implementação cumpre a Spec CASA antes do fechamento — roda o DoD e o docs-check e audita o que o gate não mecaniza — caso de borda sem teste, teste que passaria com a entrega quebrada, gotcha e estado atual não propagados. Use antes de abrir ou atualizar o PR, ou antes de marcar uma Spec como implemented.
---

# CASA · verificar

STANDARD §7 e §5.2 do casa-standard. **Esta etapa é assistiva, nunca gate:** o gate é o
`docs-check` mais o DoD, ambos determinísticos. Este relatório prepara a revisão humana do
PR; não aprova nem reprova nada sozinho.

1. Rode o DoD da Spec e `python3 scripts/docs-check`. Registre cada comando e o resultado.
2. Para cada caso de borda numerado, aponte a linha do DoD ou o teste que o exercita.
3. Para cada teste citado, responda: **em que situação ele passaria com a entrega
   quebrada?** Procure dublê no lugar do runtime, banco ou serviço real; asserção que não
   olha a consequência; só o caminho feliz. Diga onde a evidência para antes da
   consequência para o produto.
4. Fechamento (§5.2): o gotcha novo está no `AGENTS.md`? O estado atual novo está no
   capítulo de contexto? `implemented-by` lista só paths reais?
5. Relatório, um item por caso: ✅ coberto · ⚠️ fraco (por quê) · ❌ sem cobertura — cada
   ⚠️/❌ com o teste ou a linha de DoD concreta que resolveria.

Não marque a Spec como `implemented` aqui — isso é o `casa-close`.
