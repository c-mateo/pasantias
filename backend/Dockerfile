FROM node:22-alpine

# Instala bash (Adonis CLI necesita a veces sh/bash)
RUN apk add --no-cache bash

# Directorio de trabajo
WORKDIR /app

# Copia solo las definiciones de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el backend
COPY . .

# Expone el puerto de Adonis
EXPOSE 3333

# Habilita hot reload del backend
CMD ["npm", "run", "dev" ]
