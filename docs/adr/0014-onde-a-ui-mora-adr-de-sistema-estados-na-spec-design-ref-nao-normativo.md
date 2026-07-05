---
status: accepted
date: 2026-07-05
builds-on: [ADR-0003, ADR-0012]
superseded-by: null
deciders: [maicon]
---

# Onde a UI mora: ADR de sistema, estados na spec, design-ref não-normativo

## Contexto e problema

Nenhum dos quatro pilares dizia onde a UI de uma feature é definida (issue #13). O vão é
real e caro nos adotantes: no console-platon, as specs de dados/RPC são precisas mas as de
UI declaram "design visual fora de escopo" — o resultado documentado é a issue platon#12
("a maior dor relatada": ambiguidade produto/plano/oferta), a platon#3 (página pública sem
padrão) e lógica de preço duplicada em dois componentes. No linee-chat, SPEC-0004/0010
citam mockups sem artefato referenciável — e o campo já versiona referências de design
**locais** (`docs/mockups/*.html`, pasta de handoff com `tokens.css`), não só Figma.

A tentação é um quinto pilar ou um template paralelo de "spec de UI". Ambos multiplicam
artefatos; o método já tem os lugares certos.

## Direcionadores da decisão

- Sem pilar novo e sem template paralelo: feature real mistura API+UI — dois templates
  criam uma escolha a mais por doc e drift entre eles (documento sem gatilho é ruído, §3).
- Normatividade segue validabilidade (Princípio 4): "está igual ao design?" só entra no
  contrato na parte que vira `exit 0/1`.
- **A referência não pode induzir DoD fictício**: nenhum adotante tem hoje toolchain de
  visual regression/a11y — comando de exemplo copiável que o repo não possui passa no
  `docs-check` e viola o §7 de forma indetectável (ADR-0012).
- Extensão de vocabulário é deliberada e central (ADR-0003: "campo novo do padrão exige
  mudança aqui e no docs-check"); registrar por ADR local em N repos seria cada adotante
  redescobrindo o problema — o anti-padrão que o ADR-0009 documentou.

## Opções consideradas

### Opção 1 — Quinto pilar / camada "Design"
**Prós:** endereço óbvio.
**Contras:** pilar para um único tipo de conteúdo; agentes não consomem Figma; duplicaria
o que ADR+Spec já carregam. A própria issue #13 descarta.

### Opção 2 — Template separado `spec-ui.template.md` (proposta original da issue)
**Prós:** guia dedicado.
**Contras:** feature API+UI teria que escolher template; segundo arquivo na toolchain de
todos os repos; drift entre templates; a parte de UI é um bloco de orientação, não uma
estrutura diferente.

### Opção 3 — ADR (sistema) + Spec (estados) + `design-ref` central + bloco no template único
**Prós:** reusa as duas camadas existentes com os papéis que já têm (decisão datada ×
comportamento verificável); um só template; campo central sem ruído de aviso; consistente
com ADR-0003/0008/0012.
**Contras:** menos prescritivo que um template dedicado — mitigado pela nota normativa no
§5.2.

## Decisão

Opção 3, em quatro partes:

1. **Decisão estrutural de UI → ADR do repo, uma vez.** Design system, estratégia de
   tokens, padrão de responsividade e estados obrigatórios (loading/empty/error) são
   decisão datada que as specs herdam via `builds-on` — nunca redefinida por feature.
2. **Comportamento visual da feature → casos de borda EARS comuns na Spec.** "QUANDO a
   lista está vazia, o sistema DEVE exibir empty-state com CTA" é caso de borda como
   qualquer outro — e cai sob a regra do ADR-0012: linha de DoD que o exercite.
3. **Aparência → código + DoD executável com comandos reais do repo.** Tokens são código;
   regressão visual/a11y entram no DoD **quando a toolchain existe no repo** — o template
   cita essas classes de verificação como opção, sem comando de exemplo copiável.
4. **`design-ref` entra no vocabulário fechado central** (§6 + `KNOWN_KEYS`): escalar,
   URL **ou path relativo** (a prática de campo é local), **não-normativo** — divergência
   entre design e código+snapshot resolve a favor do código, e é item de `## Revisão
   humana`, nunca de gate. Sem validação de forma (precedente: `deciders`). O campo é
   **exportado ao `docs/index.json`** — campo conhecido presente no grafo, não fantasma
   (§6). `KNOWN_KEYS` é global por doc: `design-ref` fica silenciosamente legal também em
   ADR — aceito de propósito (um ADR de design system pode apontar seu artefato); specs
   são o uso primário.

## Consequências

- O adotante tem endereço normativo para UI sem artefato novo: nota no §5.2 aponta este
  ADR; o bloco comentado do `spec.template.md` guia estados + DoD honesto.
- O link de design tem lugar canônico e localizável pelo índice — e um link morto não
  quebra gate nenhum (é não-normativo; spec é editável em qualquer status).
- Fica **fora**: validação de forma do campo; visual regression como mandato (entra
  quando a toolchain do repo existir); template separado.
- Nota de dívida (observação de campo): a via de extensão **local** do §6 ("registre num
  ADR do repo") não silencia o aviso — o `docs-check` não lê ADRs do adotante; extensão
  local convive com o aviso permanente. Central continua sendo a via sem ruído.

## Confirmação

```bash
bash scripts/test-docs-check     # cenários do design-ref (vocabulário + index) verdes
python3 scripts/docs-check       # exit 0: o próprio repo segue verde
grep -q "design-ref" STANDARD.md # a semântica está no §6
```

## Notas

Gatilho: issue #13, com os dois desvios da proposta original (template único; campo
central) validados por revisão adversarial em 2026-07-05. A regra de
DoD-sem-comando-fictício vem da mesma revisão: nenhum adotante tem storybook/axe/percy
hoje — exemplo copiável mentiria. Este ADR foi reservado e criado pelo próprio
`scripts/docs-reserve` (SPEC-0007) — primeiro uso em produção.
