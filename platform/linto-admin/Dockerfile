# FROM node:latest
FROM node:20.9.0
# Gettext for envsubst being called form entrypoint script

RUN apt-get update -y && \
    apt-get install gettext -y
# RUN apt-get install python3 -y 

COPY ./vue_app /usr/src/app/linto-admin/vue_app
COPY ./webserver /usr/src/app/linto-admin/webserver
COPY ./docker-entrypoint.sh /
COPY ./wait-for-it.sh /

WORKDIR /usr/src/app/linto-admin/vue_app
RUN npm install 

WORKDIR /usr/src/app/linto-admin/webserver
RUN npm install

HEALTHCHECK CMD node docker-healthcheck.js || exit 1

EXPOSE 80
# Entrypoint handles the passed arguments
ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["npm", "run", "start"]