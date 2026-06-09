---
status: accepted
date: 2026-06-09
builds-on: []
superseded-by: null
deciders: [maicon]
---

# Frontmatter tem vocabulário fechado de campos; campo desconhecido sai como aviso

## Contexto e problema

Na adoção do piloto, referências ao conceito removido "Goal" foram migradas para um campo
`relates` inventado na hora. O parser aceitou a sintaxe, descartou o campo do `index.json`
e não disse nada: 6 documentos ficaram com metadado fantasma — presente no arquivo,
invisível para o grafo e para o próximo agente. A regra "rejeita o que não entende, nunca
ignora em silêncio" já valia para a *sintaxe* do frontmatter (§6), mas não para as *chaves*.

## Direcionadores da decisão

- Princípio do validador: nada passa em silêncio.
- Extensibilidade legítima existe — repos podem precisar de campos próprios.
- O custo de um aviso é baixo e visível; o custo do campo fantasma é invisível e composto.

## Opções consideradas

### Opção 1 — Campo desconhecido é erro
**Prós:** vocabulário inviolável.
**Contras:** mata extensão legítima; força fork do validador para qualquer campo extra.

### Opção 2 — Status quo: aceitar e descartar em silêncio
**Prós:** custo zero.
**Contras:** o caso `relates` — metadado morto que ninguém vê nascer.

### Opção 3 — Campo desconhecido é aviso
**Prós:** aparece no primeiro run; não bloqueia; extensão continua possível, mas deliberada.
**Contras:** aviso ignorado acumula ruído (aceitável: aviso não trava merge).

## Decisão

Opção 3. O vocabulário oficial é `status`, `date`, `builds-on`, `superseded-by`,
`implemented-by`, `deciders`. Campo fora dele gera **aviso** no `docs-check`. Extensão de
vocabulário num repo é permitida, mas deliberada: registre o campo num ADR do próprio repo
ou remova-o.

## Consequências

- O caso `relates` do piloto aparece como 6 avisos no primeiro run pós-atualização do script.
- Campo novo do padrão exige mudança aqui e no `docs-check` — vocabulário governado, não orgânico.

## Confirmação

```bash
grep -q "fora do vocabulário" scripts/docs-check   # exit 0: o check existe no validador
```

## Notas

Aprendizado do piloto console-platon (adoção de 2026-06-09).
