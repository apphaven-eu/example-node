FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY schema.sql ./
COPY src ./src
COPY views ./views
COPY public ./public

USER node
EXPOSE 8080

CMD ["node", "src/server.js"]
