#!/bin/sh
# install.sh — bootstrap do CASA Standard via curl | sh (ADR-0005, SPEC-0002).
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh
#   curl -fsSL .../install.sh | sh -s -- <destino> [--repo-id NOME] [--tier T0|T1]
#
# Pinagem:            CASA_REF=v1.0.0 (tag ou sha) — baixa e carimba esse ref
# Sem rede (testes):  CASA_TARBALL=/caminho/para/casa.tgz
# Auditoria: prefira baixar, ler e rodar. Este script escreve SOMENTE num
# mktemp (removido ao final) e no destino, via casa-init; sem sudo, sem $HOME.
# O corpo inteiro vive em main(), chamada na última linha — download truncado
# não executa nada.

set -eu

die() { echo "casa-install: $*" >&2; exit 1; }

main() {
    REPO="${CASA_REPO:-atplus-digital/casa-standard}"
    REF="${CASA_REF:-main}"

    command -v python3 >/dev/null 2>&1 || die "python3 é necessário e não foi encontrado no PATH"
    command -v tar >/dev/null 2>&1 || die "tar é necessário e não foi encontrado no PATH"

    TMP="$(mktemp -d)"
    trap 'rm -rf "$TMP"' EXIT INT TERM

    if [ -n "${CASA_TARBALL:-}" ]; then
        tar -xzf "$CASA_TARBALL" -C "$TMP" || die "falha ao extrair $CASA_TARBALL"
        STAMP="${CASA_REF:-local}"
    else
        command -v curl >/dev/null 2>&1 || die "curl é necessário e não foi encontrado no PATH"
        curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$REF" | tar -xz -C "$TMP" ||
            die "falha ao baixar https://github.com/$REPO @ $REF"
        STAMP="$REF"
        if [ "$REF" = "main" ] && command -v git >/dev/null 2>&1; then
            SHA="$(git ls-remote "https://github.com/$REPO" refs/heads/main 2>/dev/null | cut -c1-7)" || SHA=""
            [ -n "$SHA" ] && STAMP="$SHA"
        fi
    fi

    # raiz do pacote: tarball do codeload tem diretório-prefixo; tarball plano não
    if [ -d "$TMP/scripts" ]; then
        SRCDIR="$TMP"
    else
        SRCDIR="$(find "$TMP" -mindepth 1 -maxdepth 1 -type d | head -1)"
        [ -n "$SRCDIR" ] && [ -d "$SRCDIR/scripts" ] || die "tarball inesperado: scripts/ não encontrado"
    fi

    # sem destino (ou só flags) → diretório corrente
    case "${1:-}" in ""|-*) set -- "$PWD" "$@" ;; esac

    CASA_STANDARD_REF="$STAMP" python3 "$SRCDIR/scripts/casa-init" "$@"
}

main "$@"
