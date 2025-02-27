FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm install --force

COPY . .

RUN npm run build:docker

RUN cp -R src/html-templates dist

RUN npm install pm2 -g

ENV PORT=4009
ENV NODE_ENV production

EXPOSE 4009

CMD ["npm" ,"run", "prod:docker"]
