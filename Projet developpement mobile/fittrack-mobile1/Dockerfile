FROM node:20-alpine

WORKDIR /app

ENV CI=1

COPY package*.json ./
RUN npm install

EXPOSE 19006

CMD ["npx", "expo", "start", "--web", "--host", "lan", "--port", "19006"]