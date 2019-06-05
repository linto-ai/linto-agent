docker exec haproxy certbot-certonly -d ${DOMAIN_NAME} --email ${EMAIL} --dry-run
