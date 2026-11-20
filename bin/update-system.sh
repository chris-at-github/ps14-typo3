#!/usr/bin/env bash
#
# Brings TYPO3 in line with the installed code: database schema, upgrade
# wizards and caches. Runs in the release before it goes live (deploy) and
# locally after updates.
#
# Usage:
#   bin/update-system.sh            # on the server (PHPVERSION selects PHP)
#   ddev exec bin/update-system.sh  # locally

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

typo3() {
    echo "==> typo3 $*"
    php vendor/bin/typo3 "$@"
}

typo3 extension:setup
typo3 upgrade:run --no-interaction
typo3 cache:flush
typo3 cache:warmup
