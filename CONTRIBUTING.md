# Contribuindo com o casa-standard

Este repo é a **referência** do CASA Standard e segue o próprio padrão. A verdade técnica
mora em `STANDARD.md`, nos ADRs/Specs e nos templates; este documento só descreve o **fluxo
de contribuição** e aponta para as fontes canônicas — não redefine o padrão (Princípio 2:
um fato mora num arquivo só).

> Escala: este é um repo de referência mantido por poucas pessoas. O fluxo abaixo é
> deliberadamente enxuto — issue como rastreio, PR com conversa (`STANDARD.md` §10). Sem
> cerimônia de board/aprovação: rastreio de entrega vive na issue/PR/commit, nunca em
> `docs/` (§3).

## Fluxo

1. **Issue primeiro.** Descreva problema, escopo e fora-de-escopo. A issue é o rastreio da
   entrega — o §3 delega rastreio ao tracker, não a documento CASA.
2. **Branch** `<tipo>/<issue>-descricao`, com `<tipo>` ∈ {`feat`, `fix`, `docs`, `chore`,
   `refactor`, `test`}. Ex.: `feat/8-registry-capacidades`.
3. **Gatilhos da §3 decidem o que escrever:**
   - Decisão estrutural → **ADR** (reserve o `NNNN` em `docs/BACKLOG.md` antes).
   - Comportamento com contrato → **Spec** (DoD definido **antes** de implementar; §5.2).
   - Nada disparou? Não escreve documento — só código + PR.
   - Alterou o comportamento do `docs-check`? Atualize a **§8** do `STANDARD.md` no mesmo PR.
4. **Implemente e feche o loop.** Rode o gate até verde (ver abaixo). Spec que conclui vira
   `implemented` no mesmo commit (`implemented-by` real + `## Verificação`); regenere os
   índices com `scripts/docs-check --emit-index`.
5. **PR** com `Closes #NNN` (ou `Refs #NNN` para entrega parcial). O CI roda o `docs-check`.
6. **Commits convencionais:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## Gate técnico (Definition of Done)

O DoD é executável e mora no router — não o duplico aqui. Rode o que o `AGENTS.md`
(seção **"Como validar"**) manda; tudo precisa sair verde, e o CI cobra o mesmo `docs-check`.

## Revisão

- Mudança normativa (`STANDARD.md`, comportamento do `docs-check`) pede revisão de outra
  pessoa antes do merge.
- **ADR aceito é imutável:** correção de corpo — inclusive typo/link — exige ADR novo que
  supersede; só frontmatter e o bloco `VERDADE ATUAL` mudam (`STANDARD.md` §5.1/§8).

## O que NÃO vira documento aqui

Rastreio de entrega, épico e milestone vivem na issue/PR/commit. Plano é efêmero; ADR, Spec
e capítulo de contexto são o que permanece em `docs/`.
