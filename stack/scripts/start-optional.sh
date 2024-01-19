#!/bin/bash
set -uea
SUDO=''
. .dockerenv # Source all env

###########################################
###      LinTO Platform task monitor    ###
###########################################

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
fi

sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./optional-stack-files/linto-platform-tasks-monitor.yml \
| docker stack deploy --with-registry-auth --resolve-image always --compose-file - linto_stack

set +a
