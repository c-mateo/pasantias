FROM node:22-alpine

# Crea directorio de trabajo
WORKDIR /app

# Copia package*.json para instalar dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# HMR necesita host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
