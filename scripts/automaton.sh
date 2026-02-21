#!/bin/sh
# HodlAI Automaton Installer — thin wrapper
# curl -fsSL https://web4.hodlai.fun/automaton.sh | sh
set -e
git clone https://github.com/HodlAI/automaton.git /opt/automaton
cd /opt/automaton
npm install && npm run build
exec node dist/index.js --run
