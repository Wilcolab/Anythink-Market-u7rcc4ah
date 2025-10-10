#!/usr/bin/env bash
# Quick integration test: curl important endpoints and assert 200
set -eu -o pipefail

HOST=${HOST:-localhost}
PY_PORT=${PY_PORT:-8000}
NODE_PORT=${NODE_PORT:-8001}

echo "Checking Python server root: http://${HOST}:${PY_PORT}/"
PY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${HOST}:${PY_PORT}/") || PY_CODE="000"
echo " -> HTTP ${PY_CODE}"

echo "Checking Node server root: http://${HOST}:${NODE_PORT}/"
NODE_ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${HOST}:${NODE_PORT}/") || NODE_ROOT_CODE="000"
echo " -> HTTP ${NODE_ROOT_CODE}"

echo "Checking Node server health: http://${HOST}:${NODE_PORT}/health"
NODE_HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${HOST}:${NODE_PORT}/health") || NODE_HEALTH_CODE="000"
echo " -> HTTP ${NODE_HEALTH_CODE}"

OK=true
if [ "${PY_CODE}" != "200" ]; then
  echo "ERROR: Python root did not return 200"
  OK=false
fi
if [ "${NODE_ROOT_CODE}" != "200" ]; then
  echo "ERROR: Node root did not return 200"
  OK=false
fi
if [ "${NODE_HEALTH_CODE}" != "200" ]; then
  echo "ERROR: Node /health did not return 200"
  OK=false
fi

if [ "$OK" = true ]; then
  echo "All endpoint checks passed"
  exit 0
else
  echo "One or more checks failed"
  exit 2
fi
