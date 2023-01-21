FROM node:lts-alpine

ARG CATEGORY
ARG GUILD
ARG TOKEN

ENV CATEGORY=${CATEGORY}
ENV GUILD=${GUILD}
ENV TOKEN=${TOKEN}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npx ts-node index.ts
