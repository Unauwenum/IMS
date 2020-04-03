FROM node:10


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --save

COPY . ./

EXPOSE 8103

CMD [ "node", "bankserver.js" ]
