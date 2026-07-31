---
status: accepted
date: 2026-07-31
builds-on: [ADR-0006, ADR-0007, ADR-0010]
superseded-by: null
deciders: [maicon]
---

# Ratchet monotônico da janela de adoção por baseline versionada

## Contexto e problema

O `--warn-only` nasceu como janela temporária para repos legados, mas sempre retorna zero:
anistia erros antigos e novos sem distinguir os dois. A janela depende de alguém lembrar de
fechá-la e pode regredir enquanto a migração avança — disciplina humana permanente no ponto
em que o CASA promete automação.

O sintoma segue vivo em 2026-07-31: `linee-pipe/main` ainda executa `--warn-only` e seu
último run registrou 11 erros, enquanto a branch de entrega já executa o gate estrito com
zero erros. A simples contagem também não basta: corrigir um erro e introduzir outro mantém
o mesmo número e passa uma regressão.

## Direcionadores da decisão

- Erro legado pode pausar, mas nunca crescer nem ser trocado por outro.
- O teto precisa ser versionado, determinístico e comparável pelo CI contra a base do PR.
- Melhorar deve exigir um passo barato e explícito que torne o novo teto irreversível.
- Estado externo, relógio e rede continuam fora do gate.
- A identidade precisa ser estável entre Windows/Linux e preservar erros duplicados.

## Opções consideradas

### Opção 1 — Baseline por contagem
**Prós:** formato mínimo. **Contras:** permite trocar erro antigo por erro novo sem alterar
o total; não informa qual regressão entrou. Rejeitada.

### Opção 2 — Lista exata comparada apenas com a working tree
**Prós:** distingue erros. **Contras:** apagar/editar e recapturar a baseline pode elevar o
teto; a monotonicidade ainda dependeria da revisão humana. Rejeitada.

### Opção 3 — Multiconjunto canônico + comparação com a base Git
**Prós:** detecta troca e duplicação; o CI prova que a baseline do PR é subconjunto da base;
automação pode apertar o teto, nunca elevá-lo. **Contras:** mudança de formato diagnóstico
exige migração deliberada e branches paralelas podem conflitar no arquivo. Escolhida.

## Decisão

O modo canônico de migração passa a ser `--adoption`, apoiado por
`docs/.docs-check-baseline.json`. A baseline guarda o **multiconjunto** ordenado dos erros:
paths relativos ao root com `/`, número de linha de frontmatter removido da identidade,
ordem lexicográfica dos bytes UTF-8 e duplicatas preservadas. Schema e formato diagnóstico
são versionados; JSON malformado, não canônico, vazio ou de versão desconhecida falha.

`--emit-baseline` cria o primeiro teto ou o reduz. Erro atual fora da baseline da working
tree ou da baseline em `--base-ref` impede a escrita. No gate, estado igual passa; erro novo
falha; erro resolvido falha com mensagem positiva para atualizar e commitar o teto; zero
falha mandando remover baseline e modo de adoção. O gate estrito com zero também rejeita
baseline residual. `--warn-only` permanece somente como alias depreciado e adota as mesmas
regras seguras.

A comparação contra `--base-ref` fecha mecanicamente edição, crescimento e
delete-and-recapture dentro de PR. A primeira baseline é permitida somente quando a base
ainda não tem o arquivo **e declara CASA 1.x**. A toolchain nova materializa um snapshot
desse ref e o revalida: o teto inicial precisa ser multissubconjunto dos erros que já
existiam ali, portanto o PR de bootstrap também não pode congelar regressão. Uma base 2.x
sem baseline já encerrou a janela e não pode reabri-la. Esta é mudança incompatível do
contrato do CLI e promove o CASA a 2.0, com janela explícita de migração no §10.

A garantia pressupõe que `--base-ref` aponta para a branch de integração protegida e que
alterações no workflow do gate passam por revisão protegida. Como qualquer gate que vive no
próprio repo, trocar o comando por `HEAD` ou removê-lo contorna a política; isso é controle
de plataforma, não algo que o validador consiga provar offline sobre si mesmo. Dado o ref
protegido, inclusive a captura inicial CASA 1.x → 2.0 é verificada mecanicamente.

## Consequências

- Repo legado pode permanecer parado, mas seu conjunto de erros não muda nem cresce.
- A primeira captura usa `git archive` e diretório temporário local para comparar o estado
  real da base sem rede nem checkout mutante. Paths e OIDs materializados precisam
  coincidir com `git ls-tree`; `export-ignore`, `export-subst`, filtros, symlink e submódulo
  falham fechados.
- Cada melhoria exige regenerar e commitar a baseline; o erro corrigido não pode voltar.
- Mudança deliberada de mensagens canônicas incrementa `DIAGNOSTIC_FORMAT`. O bump não é
  uma recaptura rotineira: exige ADR e procedimento explícito de transição antes de liberar
  a nova toolchain; formato incompatível falha fechado.
- Duas branches que reduzem tetos diferentes podem conflitar; após integrar ambas,
  `--emit-baseline` recalcula o subconjunto comum do estado real.
- Elevar o teto só é possível quebrando explicitamente a regra em código/base Git — não por
  uma execução rotineira do emissor.

## Confirmação

```bash
bash scripts/test-docs-check   # casos SPEC-0009 verdes, inclusive laundering contra base
python3 scripts/docs-check --check-adr-immutability --base-ref origin/main
```

## Notas

Gatilho: issue #19. Revisão adversarial pré-implementação: Claude Opus e Kimi K3 apontaram
a fragilidade de contagem/mensagem e o loophole de recaptura; o desenho final incorporou
multiconjunto canônico, formato versionado e comparação obrigatória contra a base Git.
