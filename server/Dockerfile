FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN rm -f .env
EXPOSE 3000
CMD ["node", "server.js"]
