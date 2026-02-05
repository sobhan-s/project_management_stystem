ARG NODE_VERSION=22.22.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
