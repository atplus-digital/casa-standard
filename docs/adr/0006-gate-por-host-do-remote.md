---
status: accepted
date: 2026-06-12
builds-on: [ADR-0001]
superseded-by: null
deciders: [maicon]
---

# Adaptador do gate é escolhido pelo host do remote — hook é o fallback universal

## Contexto e problema

O ADR-0001 definiu o despacho do gate do T1 como "com remote → workflow de CI; sem
remote → pre-commit hook". O `casa-init` implementa isso perguntando apenas *se* há
remote, não *qual* — e o único adaptador de CI que existe é o do GitHub Actions
(`.github/workflows/docs-check.yml`). Num repo cujo remote é GitLab, Bitbucket ou outro
host, o `casa-init` instala um workflow que **nunca roda**, e o comando de confirmação
do ADR-0001 (`test -f .github/workflows/docs-check.yml`) passa mesmo assim. Resultado:
gate decorativo que parece T1 legítimo — exatamente o "T1 de fachada" que o ADR-0001
existe para impedir. Hoje, remote não-GitHub fica numa situação *pior* que repo sem
remote (que ao menos ganha o hook).

## Direcionadores da decisão

- Critério de design do padrão: validação por ferramenta, não por disciplina — e um
  workflow que não executa é pior que ausência de gate, porque simula presença.
- Apêndice A do STANDARD: extensão entra quando o sintoma aparecer. Não há adotante
  GitLab; escrever adaptador de CI para host hipotético é complexidade antecipada.
- No GitLab o CI é um arquivo único na raiz (`.gitlab-ci.yml`); instalar/mesclar nele
  violaria o contrato do `casa-init` de nunca tocar conteúdo do repo (SPEC-0001).
- O pre-commit hook já é gate legítimo do padrão (ADR-0001) e é agnóstico de host.

## Opções consideradas

### Opção 1 — Manter "tem remote → workflow do GitHub"
**Prós:** custo zero.
**Contras:** gate decorativo em qualquer host não-GitHub; viola o próprio ADR-0001.

### Opção 2 — Adaptador de CI por host (template GitLab, Bitbucket, …)
**Prós:** CI nativo em cada host.
**Contras:** especulação sem adotante; no GitLab exige mesclar arquivo do repo
(quebra o contrato aditivo); matriz de manutenção cresce sem sintoma que a justifique.

### Opção 3 — Despacho por host: GitHub → workflow; qualquer outro → hook + AVISO
**Prós:** fecha o buraco para todos os hosts de uma vez com o fallback que já existe;
honesto (o AVISO diz que CI daquele host não é suportado e orienta a integração manual);
preserva o contrato aditivo.
**Contras:** hook é contornável com `--no-verify` (já aceito no ADR-0001); host GitHub
Enterprise com domínio próprio cai no fallback (aceitável: o AVISO orienta).

## Decisão

Opção 3. O `casa-init` inspeciona a URL dos remotes: host `github.com` → instala o
workflow de CI (como antes); **qualquer outro host → instala o pre-commit hook e emite
AVISO** orientando a integrar `scripts/docs-check` ao CI do host; sem remote → hook,
como no ADR-0001. Adaptador de CI para outro host só entra quando houver adotante real
nesse host (Apêndice A) — e provavelmente como snippet documentado, não como arquivo
gerado.

## Consequências

- Remote não-GitHub passa a ter gate real (hook) em vez de workflow morto.
- O que vale do ADR-0001 permanece: gate automatizado por CI **ou** hook, nunca
  disciplina; o que muda é só a regra de despacho — por isso este ADR o supersede.
- SPEC-0001 (EARS 7 e 12) e STANDARD §3 atualizados no mesmo commit que aceita este ADR.
- GitHub Enterprise com domínio customizado cai no hook; quem quiser o workflow copia
  `docs/templates/docs-check.workflow.yml` à mão — o `casa-init` o preserva.

## Confirmação

```bash
# num repo adotante: o gate instalado corresponde ao host do remote
git config --get-regexp '^remote\..*\.url$' | grep -q 'github\.com' \
  && test -f .github/workflows/docs-check.yml \
  || grep -q docs-check .git/hooks/pre-commit          # exit 0: gate coerente com o host
```

## Notas

Sintoma levantado em revisão de 2026-06-12 ("como fica o CASA quando o git é GitLab?").
Cenários cobertos por `scripts/test-casa-init` (EARS-7 e EARS-12 da SPEC-0001).
