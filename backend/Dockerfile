From node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4001

ENTRYPOINT ["node"]

CMD ["index.js"]