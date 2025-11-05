# Etapa base
FROM node:22-bookworm-slim

WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar la caché
COPY package*.json ./

# Instalamos dependencias (sin limpiar la caché aún)
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

EXPOSE 5173

# Comando por defecto: modo desarrollo
CMD ["npm", "run", "dev"]
