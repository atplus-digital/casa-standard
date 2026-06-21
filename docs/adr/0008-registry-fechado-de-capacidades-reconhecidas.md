---
status: accepted
date: 2026-06-20
builds-on: [ADR-0003, ADR-0007]
superseded-by: null
deciders: [maicon]
---

# Capacidades reconhecidas: declaração no router dispara invariante de conteúdo (registry fechado)

## Contexto e problema

O `docs-check` já faz "declaração dispara validação" em pelo menos seis pontos, mas todos
ad-hoc: resolução de ponteiro de contexto (se o router cita `docs/context/X.md`, o arquivo
tem que existir), regras de Spec condicionais por `status`, vocabulário fechado de
frontmatter (ADR-0003), tier T0/T1, lint opcional de imutabilidade e o gate por host do
remote (ADR-0006). O padrão é o mesmo em todos: um sinal declarado pelo repo ativa uma
regra que o **validador já conhece**.

Faltava levar esse padrão a um lugar onde o ganho é concreto: os capítulos de contexto. O
§2 e o §4 já **nomeiam** `docs/context/TESTS.md` como capítulo canônico, mas hoje declarar
esse capítulo só garante que o arquivo exista — não que ele cumpra seu propósito (listar o
comando canônico de teste). O risco, ao tentar resolver isso, é resvalar para um "sistema
de módulos" aberto onde o repo adotante registra suas próprias validações — o que seria
complexidade sustentada por disciplina (ninguém valida o validador do módulo), justamente o
que a tese do CASA recusa.

## Direcionadores da decisão

- Validação por ferramenta, não por disciplina (tese do padrão; critério do ADR-0006: "um
  gate que não executa é pior que ausência de gate").
- Determinismo: o resultado do CI não pode virar função de quais arquivos existem no disco
  — só de quais foram **declarados** no router.
- Um fato mora num arquivo só: a regra disparada vive no `docs-check`, não duplicada num
  manifesto que o repo carrega.
- Precedente do vocabulário fechado (ADR-0003): extensão é permitida, mas **deliberada e
  central** — registrada no padrão, não improvisada pelo adotante.
- Sintoma real e estreito: o `TESTS.md` é a primeira capacidade que vale endurecer; não há
  sintoma para um motor genérico.

## Opções consideradas

### Opção 1 — Sistema de módulos aberto (o repo traz sua própria validação)
**Prós:** máxima extensibilidade; cada repo pluga o que quiser.
**Contras:** inverte a autoridade — a regra passa a morar no módulo do adotante, que ninguém
valida; multiplica a matriz de manutenção (N módulos × validação × versão × teste); mata a
auditabilidade (não dá mais para ler o `docs-check` e saber o que o gate verifica);
reimporta como plugin o rastreio de processo que o §3 expulsou para o tracker.

### Opção 2 — Gatilho por presença física do arquivo no disco
**Prós:** "se existe `TESTS.md`, valida" é intuitivo.
**Contras:** ação à distância — a nota do CI vira função de quais arquivos aparecem no
repo, não de uma intenção declarada. Quebra o determinismo que o resto do padrão preserva
(id derivado do path, gate pelo host). Em todo o CASA o gatilho positivo é **declaração**,
nunca presença; a única varredura de disco (higiene) só procura lixo, jamais atribui
semântica positiva a um arquivo.

### Opção 3 — Registry FECHADO de capítulos reconhecidos, disparado por declaração no router
**Prós:** generaliza o que o validador já faz (resolução de ponteiro), sem motor novo; o
gatilho é a declaração no router (determinístico, alinhado ao Princípio 2); a regra mora no
`docs-check`, versionada e testada; o conjunto é fechado e só cresce por ADR.
**Contras:** cada capacidade nova exige um PR no `casa-standard` (não é auto-serviço do
adotante) — aceitável e proposital: é o mesmo custo deliberado do vocabulário fechado.

## Decisão

Opção 3. O `docs-check` passa a ter um conjunto **fechado** de capítulos reconhecidos
(`RECOGNIZED_CHAPTERS`). Quando o router **declara** um deles no Mapa de contexto, o
validador aplica um invariante de **conteúdo** que ele já conhece. O gatilho é a declaração
no router, nunca a presença do arquivo no disco; a regra mora no validador, nunca é trazida
pelo repo adotante. O primeiro — e por ora único — membro é `docs/context/TESTS.md`, que
passa a exigir ao menos um comando canônico em bloco de código (mesmo critério do DoD
global). Capacidade nova entra como qualquer mudança normativa (§10): ADR no `casa-standard`
+ atualização da §8 e do `docs-check` no mesmo PR. Esta mudança é compatível e promove o
contrato para `casa-version` 1.2.

## Consequências

- Declarar `TESTS.md` deixa de ser só "o arquivo existe" e passa a garantir que ele cumpra
  seu papel — sem nenhum motor de plugins.
- O caminho para SECURITY/MIGRATIONS/… fica aberto, porém **estreito**: cada um é uma
  entrada no registry defendida por ADR, não um arquivo que o adotante larga.
- Fica explicitamente **fora**: validar processo/estado de GitHub Projects (verdade em
  serviço → GitHub Action, não `docs-check`) e qualquer validação que o repo adotante
  forneça por conta própria.
- O `casa-init` distribui o template `context.TESTS.template.md`; adotar a capacidade é
  copiá-lo para `docs/context/TESTS.md` e apontá-lo no router.

## Confirmação

```bash
python3 scripts/docs-check                    # exit 0: o próprio repo segue verde
bash scripts/test-docs-check                  # exit 0: cenários da capacidade TESTS verdes
```

## Notas

Gatilho: a revisão do padrão de 2026-06-20 sobre "padronizar mais o trabalho dos agentes"
concluiu que o ganho real não é uma camada de processo, e sim tornar explícito o mecanismo
"declaração dispara validação" que o validador já usa — com `TESTS.md` como primeiro membro.
Comportamento detalhado em SPEC-0004.
