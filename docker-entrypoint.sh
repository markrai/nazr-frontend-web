#!/bin/sh
set -e

# Default to 'nazr' for docker-compose deployments
export BACKEND_HOST=${BACKEND_HOST:-nazr}

# Substitute environment variables in nginx config template
envsubst '${BACKEND_HOST}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'

