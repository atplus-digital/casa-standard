# CASA — Contexto, ADRs, Specs, Automação

**Versão:** 1.0 (enxuta, rev. 7) · **Status:** accepted (2026-06-09) · **Mantenedor:** (definir owner)

Padrão de workflow de desenvolvimento para todos os projetos da empresa, desenhado para times onde agentes de IA (Claude Code, Cursor, Opencode, Codex e similares) são executores de primeira classe. Critério de design: **complexidade sustentada por automação é barata; complexidade sustentada por disciplina humana apodrece.** Tudo aqui é validado por ferramenta ou custa quase nada. O que dependeria de disciplina sem validação está no Apêndice A — entra quando o sintoma aparecer.

**Regra de promoção (cumprida em 2026-06-09):** o padrão só seria promovido depois que um repo-piloto passasse verde no `docs-check` — o console-platon passou (66 docs migrados, 0 erros) e o próprio `casa-standard` opera sob o padrão (ADRs 0001–0005, Specs 0001–0002, três suítes no CI). O princípio permanece para toda mudança futura: um padrão desmentido pela própria referência ensina o agente a desconfiar de todas as suas garantias.

---

## 1. Princípios

1. **Contexto causal > estado atual.** O agente precisa saber *por que* as coisas são como são. Decisões estruturais viram documento, e documentos se referenciam.
2. **Um fato mora num arquivo só.** Onde dois documentos tratam do mesmo assunto, um aponta para o outro — nunca copia. Multi-arquivo sem essa regra é multi-fonte-da-verdade, pior que arquivo gigante.
3. **DECISÃO ≠ ESTADO ATUAL.** Decisão é datada e imutável (ADR). Estado atual é mutável e vive em capítulo de contexto. Misturar os dois é o que gera emenda inline em ADR aceito.
4. **Critério de aceite é comando, não parágrafo.** O agente fecha o próprio loop.
5. **Repo limpo é parte do padrão.** Duplicados e artefatos de sync confundem o agente — um glob de specs que acha `0039-x.md` e `0039-x 2.md` pode pegar o errado. Higiene é gate de CI, não boa vontade.

---

## 2. Estrutura de repositório

```
AGENTS.md                  # ROUTER: alto-ROI transversal + mapa de contexto (§4)
docs/
  context/                 # capítulos de ESTADO ATUAL, carga sob demanda (§4)
    INFRA.md  TESTS.md  CONVENTIONS.md  ...   # um assunto por arquivo
  adr/                     # DECISÕES — se houver decisão estrutural
  specs/                   # COMPORTAMENTO — se houver feature com contrato
  templates/               # cópias dos templates oficiais
  BACKLOG.md               # pendências + reservas de NNNN — se houver (§5)
scripts/
  docs-check               # valida frontmatter, grafo e higiene (§8)
  pre-commit               # gate local quando não há remote (§3)
<subdir>/AGENTS.md         # opcional: regras que só valem naquele pacote (§4)
```

`AGENTS.md` e o DoD executável existem **sempre**. O resto só existe quando algum gatilho disparar.

---

## 3. Dois níveis, dois gatilhos

Cada repo declara seu nível no `AGENTS.md`:

- **T0 — leve** (script, POC, ferramenta descartável): só `AGENTS.md` + DoD mínimo (build/teste verde).
- **T1 — padrão** (todo o resto): tudo deste documento, com `docs-check` em **gate automatizado** — CI quando o remote é de host com adaptador (hoje: GitHub); pre-commit hook nos demais casos — sem remote ou host sem adaptador, com aviso para integrar o `docs-check` ao CI do host (referência: `scripts/pre-commit`; decisão: ADR-0006 do `casa-standard`). Gate documental ("está no DoD do router") não conta: é disciplina, não automação.

Dentro de T1, o que escrever é decidido por **gatilho**:

| Aconteceu isto… | …então escreve |
|---|---|
| Decisão estrutural (escolha de backend, modelo de acoplamento, estratégia de falha parcial) | **ADR** |
| Feature com contrato observável (API, fluxo de usuário, casos de borda que importam) | **Spec** |

Nada disparou? Não escreve nada. Documento sem gatilho é ruído.

> Agrupamento de entregas (épicos, milestones, rastreio de implementação) **não é papel de documento CASA** — é papel do PR, do issue tracker e do commit. Entrega que atravessa várias Specs se rastreia pelo PR/tracker, não por um documento agregador.

---

## 4. Contexto em camadas

O contexto operacional é organizado por **custo de contexto**, não por assunto solto:

**Camada 1 — Router (`/AGENTS.md`, carga sempre, teto de ~150 linhas).** Só o alto-ROI transversal: contexto em 5 linhas, DoD global, comandos de validação/deploy, gotchas, e o **Mapa de contexto** — um índice dos capítulos onde cada entrada diz *quando carregar* ("mexeu em migration → leia `docs/context/INFRA.md`"). Estourou o teto, o conteúdo desce para um capítulo; o router fica com o ponteiro.

**Camada 2 — Capítulos (`docs/context/*.md`, carga sob demanda).** Um assunto por arquivo (INFRA, TESTS, SECURITY, CONVENTIONS…). Conteúdo **imperativo e atemporal**: "rode X", "NUNCA use Y", "o estado atual é Z". É aqui que mora o ESTADO ATUAL — o que tira dos ADRs a pressão de serem emendados.

**Camada 3 — AGENTS.md aninhado (`<subdir>/AGENTS.md`, lazy nativo).** Regras que só valem num pacote (ex.: `supabase/AGENTS.md`). O agente carrega só ao tocar o subtree (nearest-wins).

Duas regras que sustentam o modelo:

- **Fato técnico (load-bearing; semântica verificada no Claude Code — nos demais agentes, trate o lazy-loading do aninhamento como melhor esforço até verificar):** `@import` inline **não** economiza contexto — expande tudo no launch. Só AGENTS.md aninhado abaixo do CWD é lazy de verdade. Portanto: **proibido** colar capítulo grande via `@import` no router; composição pesada = ponteiro + leitura sob demanda + aninhamento.
- **Fronteira anti-duplicação:** capítulo = imperativo/atemporal; ADR/Spec = decisão/comportamento datado e versionado. Onde sobrepõe, o capítulo aponta ("modelo de integração: ver ADR-0032") — nunca copia o corpo.

---

## 5. As duas camadas documentais

```
ADR (decisão, o porquê)  →  Spec (comportamento, o quê)  →  código + CI (a entrega)
```

Spec cita os ADRs que a fundamentam e não os redefine. Arquivos em `docs/<camada>/NNNN-titulo-kebab.md`; numeração **local por repo e por camada**. Reserve o próximo `NNNN` no PR que cria o doc e registre a reserva em `docs/BACKLOG.md` — é o ledger que evita dois PRs paralelos alocando o mesmo número (o `docs-check` rejeita id duplicado, mas só pós-merge; renumerar depois cascateia nos `builds-on`). Referência cross-repo usa `repo:ADR-0032` com o `casa-repo-id` do router.

### 5.1 ADR — a decisão

Base MADR 4.0 completa: contexto, direcionadores, opções com prós/contras, decisão, consequências e **`## Confirmação`** — como verificar que a decisão está sendo respeitada na prática (comando, query, inspeção). É a seção que fecha o loop para o agente. Status: `proposed → accepted → deprecated | superseded`.

Regras de imutabilidade, agora sem a pressão que as quebrava:

- ADR carrega **só a decisão datada**. Estado atual decorrente dela vive em capítulo de contexto, que aponta para o ADR. Mudou o estado, edita o capítulo — o ADR fica em paz.
- **Critério mecânico emenda-vs-supersessão:** corrigiu erro de digitação/link → pode editar. Mudou *qualquer* aspecto da decisão (critério, escopo, condição) → ADR novo que supersede. Não existe "correção crítica" inline.
- ADR superado recebe no topo o bloco de no máximo 3 linhas — única edição substantiva permitida:

```
> ⚠️ VERDADE ATUAL: <o que ainda vale; o que foi revogado; ADR fonte atual>
```

O `docs-check` exige o bloco **real** (fora de comentário HTML — o exemplo do template não conta) em todo ADR `superseded`, e que `superseded-by` (escalar, sem auto-referência) resolva para outro ADR. Não se inventa em ADR: decisão de negócio não tomada vira item no issue tracker — ou, em repo sem tracker, em `docs/BACKLOG.md` (fora de `docs/context/`: backlog é pendência, não estado imperativo). Nunca vira ADR.

### 5.2 Spec — o comportamento e a entrega

Fluxo, contrato, casos de borda e DoD **antes** de implementar. Status: `draft → accepted → implemented → deprecated`.

- **Chega decidida:** o que não dá pra decidir vai para `## Questões em aberto` e **bloqueia** aquele ponto — o agente não improvisa sobre questão aberta.
- **Casos de borda** preferencialmente em EARS, agnóstico de stack: "QUANDO ⟨gatilho⟩ o sistema DEVE ⟨resposta⟩". Formato sugerido, não mandato.
- **DoD executável obrigatório** (§7). Sem ele, não sai de `draft`.
- **Fechamento:** na transição para `implemented`, no mesmo commit: `implemented-by` recebe os paths reais (código, migrations, functions); a seção `## Verificação` recebe a evidência do DoD (comandos rodados + resultado); gotchas descobertos vão para o `AGENTS.md`; estado atual novo vai para o capítulo de contexto pertinente. O `docs-check` valida o lado-Spec do fechamento (`implemented-by` preenchido, `## Verificação` sem placeholder); a propagação de gotchas→`AGENTS.md` e estado→capítulo **não** é mecanizável e fica na revisão humana do PR — é o ponto mais frágil do ciclo.
- Convenções compartilhadas entre specs moram em `docs/context/CONVENTIONS.md` (capítulo de leitura obrigatória, apontado pelo router) — não no README de specs.

---

## 6. Frontmatter — mínimo e derivado

**`id` e `title` não existem no frontmatter — são derivados.** O `id` vem da pasta + filename (`docs/adr/0032-dns.md` → `ADR-0032`); o `title` vem do primeiro `# H1` do corpo. Determinístico, impossível de divergir, menos campo manual.

```yaml
---
status: accepted             # vocabulário fechado por camada (§5)
date: 2026-06-09
builds-on: [ADR-0005]        # referências a montante
superseded-by: null          # ADRs apenas; escalar; aponta para o ADR que o substitui
implemented-by: []           # Specs: paths reais, preenchido no fechamento
---
```

O frontmatter aceita só o subconjunto YAML do exemplo — escalar, lista inline e lista em bloco (`- item`). O `docs-check` **rejeita com erro** qualquer outra sintaxe em vez de ignorá-la em silêncio.

O vocabulário de campos é **fechado**: `status`, `date`, `builds-on`, `superseded-by`, `implemented-by`, `deciders`. Campo fora dele sai como **aviso** — extensão é permitida, mas deliberada: registre o campo novo num ADR do repo ou remova-o. Campo fantasma (presente no arquivo, ausente do grafo) não fica.

Os `README.md` das pastas de docs (tabela id/título/status) são **gerados** pelo `docs-check` — nunca editados à mão.

---

## 7. Definition of Done executável

Toda Spec (e o repo, via router) define o DoD como comandos com critério binário:

```markdown
## Definition of Done
​```bash
npm run typecheck          # exit 0
npm test -- --run dns      # 36/36 verdes
deno check supabase/functions/dns/
​```
```

Cada linha é executável no ambiente descrito no router; sucesso é exit code ou asserção no comentário. Linha parametrizada (ex.: `deno check functions/<fn>/`) declara como enumerar o parâmetro ("para cada Edge alterada") ou vem em forma de loop — placeholder sem regra de enumeração não é executável. O que exige olho humano vai para `## Revisão humana`, separado — o agente sabe o que está e o que não está no loop dele.

---

## 8. docs-check — o que o CI valida

`scripts/docs-check` roda no gate automatizado de todo repo T1 (§3 — CI ou pre-commit hook). **Erro = exit 1 por padrão**; `--warn-only` imprime tudo e sai 0, e existe só para a janela de adoção (§10).

1. **Frontmatter válido**: sintaxe dentro do subconjunto suportado (§6 — linha não reconhecida é erro, nunca ignorada), campos obrigatórios (`status`, `date`), data de calendário real em `AAAA-MM-DD`, vocabulário de status por camada, e vocabulário fechado de campos — campo desconhecido sai como aviso (§6).
2. **Derivação íntegra**: filename no padrão `NNNN-kebab.md`, H1 presente no corpo (após o frontmatter; comentário não conta), id único.
3. **Grafo íntegro**: `builds-on`/`superseded-by` resolvem (referência cross-repo vira aviso); sem auto-supersessão; `superseded-by` só em ADR e apontando para ADR; ADR `superseded` tem o bloco `VERDADE ATUAL` real, fora de comentário.
4. **Spec consistente**: `accepted`/`implemented` tem `## Definition of Done`; `implemented` tem `implemented-by` não-vazio e `## Verificação` sem o placeholder — uma Spec só chega a `implemented` no commit de fechamento, onde esses campos são preenchidos.
5. **Higiene de árvore**: `.orig`, `conflicted copy` e `.DS_Store` sempre; cópia numerada (`x 2.md`, `x copy.md`, `x (1).md`) quando o original existe ao lado — em **todo o repo**, ignorando `.git`, `node_modules`, `.venv`, `dist` e afins.
6. **Router dentro do teto**: `AGENTS.md` acima de ~150 linhas sai como aviso (mova conteúdo para capítulo).
7. **Índices frescos**: compara os READMEs gerados (e `docs/index.json`, se existir) com os commitados e **falha** se divergirem; `scripts/docs-check --emit-index` regenera.

---

## 9. Ciclo de vida de uma entrega

1. Surge a necessidade; gatilhos da §3 dizem o que escrever.
2. Decisão estrutural? **ADR** `proposed` → revisão → `accepted`. Estado atual decorrente vai para capítulo de contexto.
3. Contrato observável? **Spec** citando os ADRs, questões resolvidas ou registradas em aberto, DoD definido → `accepted`.
4. O agente lê o router, carrega os capítulos que o mapa indicar, abre ADRs/Specs do subgrafo, implementa.
5. Agente roda o DoD até verde.
6. Fechamento atômico em um commit: Spec `implemented` + `implemented-by` + `## Verificação`; gotchas → router; estado novo → capítulo; READMEs regenerados.
7. CI roda o `docs-check`. Divergiu, não entra.

---

## 10. Adoção — projeto novo ou repo existente

**A infraestrutura entra por ferramenta, não por checklist**: `scripts/casa-init <destino>` (do repo `casa-standard`) instala e atualiza validador, templates, router (se ausente) e o gate do §3 em qualquer estado de repo — vazio, novo, legado, com docs ADR/SDD pré-existentes. Aditivo e idempotente: nunca toca conteúdo do repo, e rodar de novo atualiza a toolchain (carimbo `casa-standard-ref` no router diz de qual versão o repo veio). Sem clonar: `curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh -s -- <destino>` baixa o repo num temporário e roda o mesmo `casa-init` (pinável com `CASA_REF=<tag|sha>`). Projeto **novo** termina aqui: nasce verde.

Repo **existente**: o `casa-init` instala a base e o `docs-check` relata o que falta; a migração de **conteúdo** exige julgamento e segue incremental, nesta ordem: (1) **limpar a árvore** — os duplicados saem antes de qualquer outra coisa, é o gate mais barato e de maior efeito; (2) preencher o `AGENTS.md` router (pode parar aqui em T0); (3) declarar o tier; (4) extrair capítulos de contexto do que hoje está espalhado (convenções do README de specs → `CONVENTIONS.md`); (5) frontmatter mínimo nos docs existentes — doc tocado, doc migrado; status legado migra pelo estado **real verificado** (spec só vira `implemented` se a implementação está no ar), nunca por rename mecânico; template antigo em pasta de docs vai para `docs/templates/`; referência a conceito fora do padrão ou vira campo registrado (ADR do repo, §6) ou é removida; ADRs já emendados inline ganham `VERDADE ATUAL` apontando para a verdade, sem reescrever histórico; (6) `docs-check --warn-only` enquanto o repo ainda não passa limpo — assim que passar sem a flag, o gate vale imediatamente (o gate em si — CI ou hook — o `casa-init` já instalou).

O padrão vive num repo simples (`casa-standard`) com este documento, os templates, o `docs-check` e o `casa-init` de referência. Mudança é PR com conversa.

---

## Apêndice A — Extensões futuras (adotar quando o sintoma aparecer)

**A.1 Tiers granulares (T2/T3).** Revisão de par obrigatória em ADR, evidência anexada por log/CI. Sintoma: incidente ou auditoria que o T1 não teria prevenido.

**A.2 `docs/index.json` machine-readable.** Grafo completo como ponto de entrada do agente. Sintoma: repo passar de ~30 docs. O `docs-check --emit-index` já emite o arquivo.

**A.3 Lint de imutabilidade de ADR.** CI compara diff de ADR `accepted` e só permite mudança em frontmatter e bloco `VERDADE ATUAL`. Sintoma: reincidência de emenda inline mesmo com o modelo DECISÃO/ESTADO separados.

**A.4 Governança versionada + faixa ORG-ADR.** `casa-version` por repo, janela de migração, ADRs de organização com índice federado. Sintoma: 10+ repos ativos ou mais de um time mantendo o padrão.

---

## Anexos deste pacote

- `docs/templates/AGENTS.template.md` — router com mapa de contexto
- `docs/templates/adr.template.md` — MADR 4.0 + Confirmação + VERDADE ATUAL
- `docs/templates/spec.template.md` — Spec com DoD, EARS e fechamento (Verificação)
- `scripts/docs-check` — valida frontmatter, grafo e higiene; regenera índices (§8)
- `scripts/pre-commit` — gate local de referência para repo sem remote (§3)
- `scripts/casa-init` — instala/atualiza a infraestrutura CASA num repo adotante (§10; testado por `scripts/test-casa-init` no CI)
- `install.sh` — bootstrap via curl|sh, sem clone (§10; testado por `scripts/test-install` no CI)
- `docs/templates/docs-check.workflow.yml` — workflow de CI distribuído pelo `casa-init`
