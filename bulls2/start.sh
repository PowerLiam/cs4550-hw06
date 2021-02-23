#!/bin/bash

export SECRET_KEY_BASE=insecure
export MIX_ENV=prod
export PORT=4792

CFGD=$(readlink -f ~/.config/bulls2)

if [ ! -e "$CFGD/base" ]; then
    echo "Need to deploy first"
    exit 1
fi

SECRET_KEY_BASE=$(cat "$CFGD/base")
export SECRET_KEY_BASE

echo "Stopping old copy of app, if any..."

_build/prod/rel/bulls2/bin/bulls2 stop || true

echo "Starting app..."

_build/prod/rel/bulls2/bin/bulls2 start
