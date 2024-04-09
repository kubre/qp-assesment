FROM node:20.12.1-slim

RUN mkdir -p /opt/app 

WORKDIR /opt/app

COPY package.json package-lock.json .

RUN npm install && npm install typescript -g

COPY . .

RUN npm run build

