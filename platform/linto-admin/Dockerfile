FROM node:latest
# Gettext for envsubst being called form entrypoint script
RUN apt-get update -y && \
    apt-get install gettext -y

COPY ./vue_app /usr/src/app/linto-admin/vue_app
COPY ./webserver /usr/src/app/linto-admin/webserver
COPY ./docker-entrypoint.sh /
COPY ./wait-for-it.sh /

WORKDIR /usr/src/app/linto-admin/vue_app
RUN npm install && npm install -s node-sass

WORKDIR /usr/src/app/linto-admin/webserver
RUN npm install

HEALTHCHECK CMD node docker-healthcheck.js || exit 1

EXPOSE 80
# Entrypoint handles the passed arguments
ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["npm", "run", "start"]