#!/usr/bin/env fish

set token_line (grep GITHUB_TOKEN .env.local)
set token_val (string trim -c '"' (string split '=' $token_line)[2])
set -lx GITHUB_TOKEN $token_val

npm run next-dev