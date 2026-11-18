---
name: casa-apply
description: Implementa uma Spec CASA aceita até o DoD ficar verde, respeitando os ADRs de builds-on e sem improvisar sobre questão em aberto. Use ao implementar, corrigir ou continuar uma feature descrita em docs/specs/ de um repo CASA.
---

# CASA · aplicar

Etapas 4–5 do ciclo — §9 do [STANDARD](https://github.com/atplus-digital/casa-standard/blob/main/STANDARD.md) (na versão da toolchain instalada).

1. **Confira a Spec:** `status: accepted` e nenhum `- [ ]` em `## Questões em aberto`.
   Em `draft`, ou com questão aberta no ponto que você vai tocar: pare e pergunte — o agente
   não improvisa sobre questão aberta (§5.2).
2. Leia os ADRs de `builds-on` e respeite cada `## Confirmação`.
3. Implemente caso de borda por caso de borda, escrevendo ou ajustando o teste que a linha
   de DoD correspondente roda.
4. Rode o DoD da Spec e o DoD global do router até tudo verde. Nunca troque ou afrouxe um
   comando de DoD para ele passar.
5. Anote enquanto trabalha, para o `casa-close`: gotcha não-inferível que custou tentativa,
   estado atual que mudou (vai para capítulo de contexto) e os paths reais tocados (vão para
   `implemented-by`).

O contrato precisou mudar no meio do caminho? Volte à Spec — e à revisão humana — antes de
seguir. Código e Spec não divergem.
