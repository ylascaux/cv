#!/bin/sh
set -eu

npm run build:site
npm run pdf:generate
exec npm run preview -- --host 0.0.0.0 --port 4321
