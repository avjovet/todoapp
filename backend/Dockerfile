# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalamos nodemon globalmente
RUN npm install -g nodemon

# Copiamos package.json y lock
COPY package*.json ./

# Aseguramos instalar también las devDependencies
ENV NODE_ENV=development
RUN npm install

COPY . .

EXPOSE 5000

# Ejecutamos nodemon directamente
CMD ["nodemon", "server.js"]
