FROM node:8.17
MAINTAINER devops@adpushup.com
WORKDIR /usr/src/app
COPY package.json .

RUN npm install
RUN npm install pm2 -g
COPY . .

EXPOSE 3100

CMD ["pm2-runtime", "pm2-process.json"];
#CMD ["node", "app.js"];
