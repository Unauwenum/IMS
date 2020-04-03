FROM node:10


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --save
RUN npm install xmlhttprequest

COPY . ./

EXPOSE 8080

CMD [ "node", "datadelivery.js" ]
