FROM node

WORKDIR /usr/src/app/linto-platform-overwatch

COPY . /usr/src/app/linto-platform-overwatch

RUN npm install

HEALTHCHECK CMD node docker-healthcheck.js || exit 1

EXPOSE 80

COPY ./wait-for-it.sh /
COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]

#CMD ["node", "index.js"]