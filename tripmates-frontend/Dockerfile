FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

# Limpia cache y fuerza reinstalación completa
RUN npm cache clean --force && rm -rf node_modules package-lock.json

# Instala dependencias y fuerza binarios de rolldown
RUN npm install --force

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
