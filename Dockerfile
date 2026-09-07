FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
