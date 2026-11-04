# =============================================================================
# ESU: Ecosistema de Salud Unificado (Cruz del Eje)
# Frontend: Dockerfile Multietapa (Node Builder + Nginx Alpine Runner)
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa 1: Compilación de la aplicación React con Vite
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Optimización de caché de dependencias npm (instalación reproducible con lockfile)
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar a HTML/CSS/JS estático
COPY . .
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
RUN npm run lint && npm run build

# -----------------------------------------------------------------------------
# Etapa 2: Servidor web de producción ligero (Nginx Alpine)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build compilado generado en la etapa 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Verificación de salud del servidor Nginx
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
