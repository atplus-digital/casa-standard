#!/bin/sh
# install.sh — CASA Standard bootstrap via curl | sh (ADR-0005, SPEC-0002).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/atplus-digital/casa-standard/main/install.sh | sh
#   curl -fsSL .../install.sh | sh -s -- <target> [--repo-id NAME] [--tier T0|T1]
#
# Pinning:            CASA_REF=v1.0.0 (tag or sha) — downloads and stamps that ref. In a pipe,
#                     pass the variable to sh: curl … | CASA_REF=v1.0.0 sh -s -- <target>
# Offline (tests):    CASA_TARBALL=/path/to/casa.tgz
# Auditing: prefer downloading, inspecting, and running locally. This script writes ONLY to
# a temporary mktemp directory (cleaned up on exit) and to the target via casa-init; no sudo,
# no $HOME writes. The entire body lives inside main(), invoked on the very last line — a
# truncated download executes nothing.

set -eu

die() { echo "casa-install: $*" >&2; exit 1; }

main() {
    REPO="${CASA_REPO:-atplus-digital/casa-standard}"
    REF="${CASA_REF:-main}"

    command -v python3 >/dev/null 2>&1 || die "python3 is required and was not found in PATH"
    command -v tar >/dev/null 2>&1 || die "tar is required and was not found in PATH"

    TMP="$(mktemp -d)"
    trap 'rm -rf "$TMP"' EXIT INT TERM

    if [ -n "${CASA_TARBALL:-}" ]; then
        tar -xzf "$CASA_TARBALL" -C "$TMP" || die "failed to extract $CASA_TARBALL"
        STAMP="${CASA_REF:-local}"
    else
        command -v curl >/dev/null 2>&1 || die "curl is required and was not found in PATH"
        curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$REF" | tar -xz -C "$TMP" ||
            die "failed to download https://github.com/$REPO @ $REF"
        STAMP="$REF"
        if [ "$REF" = "main" ] && command -v git >/dev/null 2>&1; then
            SHA="$(git ls-remote "https://github.com/$REPO" refs/heads/main 2>/dev/null | cut -c1-7)" || SHA=""
            [ -n "$SHA" ] && STAMP="$SHA"
        fi
    fi

    # package root: codeload tarballs contain a prefix directory; flat tarballs do not
    if [ -d "$TMP/scripts" ]; then
        SRCDIR="$TMP"
    else
        SRCDIR="$(find "$TMP" -mindepth 1 -maxdepth 1 -type d | head -1)"
        [ -n "$SRCDIR" ] && [ -d "$SRCDIR/scripts" ] || die "unexpected tarball layout: scripts/ not found"
    fi

    # no target (or flags only) → current working directory
    case "${1:-}" in ""|-*) set -- "$PWD" "$@" ;; esac

    CASA_STANDARD_REF="$STAMP" python3 "$SRCDIR/scripts/casa-init" "$@"
}

main "$@"
