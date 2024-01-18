FROM node:latest

WORKDIR /usr/src/app/business-logic-server

COPY . /usr/src/app/business-logic-server
RUN npm install && \
 npm install @linto-ai/node-red-linto-core && \
 npm install @linto-ai/node-red-linto-calendar && \
 npm install @linto-ai/node-red-linto-datetime && \
 npm install @linto-ai/node-red-linto-definition && \
 npm install @linto-ai/node-red-linto-meeting && \
 npm install @linto-ai/node-red-linto-memo && \
#  npm install @linto-ai/node-red-linto-news && \
 npm install @linto-ai/node-red-linto-pollution && \
 npm install @linto-ai/node-red-linto-weather && \
 npm install @linto-ai/node-red-linto-welcome && \
 npm install @linto-ai/linto-skill-room-control && \
 npm install @linto-ai/linto-skill-browser-control

# RUN npm install
# RUN npm install @linto-ai/node-red-linto-core
# RUN npm install @linto-ai/node-red-linto-calendar
# RUN npm install @linto-ai/node-red-linto-datetime
# RUN npm install @linto-ai/node-red-linto-definition
# RUN npm install @linto-ai/node-red-linto-meeting
# RUN npm install @linto-ai/node-red-linto-memo
# RUN npm install @linto-ai/node-red-linto-news
# RUN npm install @linto-ai/node-red-linto-pollution
# RUN npm install @linto-ai/node-red-linto-weather
# RUN npm install @linto-ai/node-red-linto-welcome
# RUN npm install @linto-ai/linto-skill-room-control
# RUN npm install @linto-ai/linto-skill-browser-control

HEALTHCHECK CMD node docker-healthcheck.js || exit 1
EXPOSE 80

COPY ./docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["node", "index.js"]
