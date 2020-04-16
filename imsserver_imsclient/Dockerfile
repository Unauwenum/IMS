FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install mariadb


COPY . .

EXPOSE 8080

CMD [ "node","--unhandled_rejections:strict","imsserver.js" ]