# Guía de Deployment con Docker

Esta guía explica cómo desplegar CMPC LIMS en producción usando Docker Compose.

## Requisitos Previos

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Docker y Docker Compose instalados
- Puerto 80 (frontend) y 3000 (backend) disponibles
- Acceso SSH al servidor

## Instalación de Docker (si no está instalado)

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker (opcional, para no usar sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

## Paso 1: Clonar el Repositorio

```bash
# Clonar en el servidor
git clone https://github.com/arvergara/CMPC.git cmpc-lims
cd cmpc-lims
```

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

### Valores a configurar:

```bash
# Database - Usa contraseñas seguras
POSTGRES_PASSWORD=tu_password_seguro_aqui

# JWT - Genera secrets seguros con: openssl rand -base64 32
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# SMTP - Configuración de email
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# URLs - Cambia por tu dominio/IP
FRONTEND_URL=http://tu-servidor.com
VITE_API_URL=http://tu-servidor.com:3000/api
```

## Paso 3: Build y Deploy

```bash
# Build de las imágenes
docker compose -f docker-compose.prod.yml build

# Iniciar los servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

## Paso 4: Ejecutar Migraciones de Base de Datos

```bash
# Acceder al contenedor del backend
docker exec -it cmpc-lims-backend-prod sh

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Ejecutar seed para datos iniciales
npm run prisma:seed

# Salir del contenedor
exit
```

## Paso 5: Crear Usuario Administrador

```bash
# Opción 1: Usando la API (recomendado)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cmpc.cl",
    "password": "PasswordSeguro123!",
    "nombre": "Administrador",
    "rol": "ADMIN"
  }'

# Opción 2: Directamente en la base de datos
docker exec -it cmpc-lims-postgres-prod psql -U cmpc_user -d cmpc_lims
# Luego ejecuta SQL para crear usuario admin
```

## Comandos Útiles

### Ver estado de servicios
```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs de un servicio específico
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Reiniciar servicios
```bash
# Reiniciar todos
docker compose -f docker-compose.prod.yml restart

# Reiniciar uno específico
docker compose -f docker-compose.prod.yml restart backend
```

### Detener servicios
```bash
docker compose -f docker-compose.prod.yml down
```

### Actualizar la aplicación
```bash
# Detener servicios
docker compose -f docker-compose.prod.yml down

# Obtener últimos cambios
git pull

# Rebuild y reiniciar
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones si hay cambios en la BD
docker exec -it cmpc-lims-backend-prod npx prisma migrate deploy
```

### Backup de la Base de Datos
```bash
# Crear backup
docker exec cmpc-lims-postgres-prod pg_dump -U cmpc_user cmpc_lims > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i cmpc-lims-postgres-prod psql -U cmpc_user cmpc_lims < backup_20250126_103000.sql
```

## Configuración de Nginx como Reverse Proxy (Opcional)

Si quieres usar un dominio y HTTPS, configura Nginx:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/cmpc-lims
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar y obtener HTTPS:

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/cmpc-lims /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtener certificado SSL (HTTPS)
sudo certbot --nginx -d tu-dominio.com
```

## Troubleshooting

### El backend no inicia
```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs backend

# Verificar conexión a base de datos
docker exec -it cmpc-lims-backend-prod sh
npx prisma db push
```

### Error en migraciones
```bash
# Resetear la base de datos (CUIDADO: borra todos los datos)
docker exec -it cmpc-lims-backend-prod npx prisma migrate reset
```

### Limpiar todo y empezar de nuevo
```bash
docker compose -f docker-compose.prod.yml down -v
docker system prune -a
# Luego volver a ejecutar desde el Paso 3
```

## Monitoreo

### Ver uso de recursos
```bash
docker stats
```

### Health checks
```bash
# Backend
curl http://localhost:3000/api/health

# Frontend
curl http://localhost/
```

## Seguridad

1. **Firewall**: Configura UFW para abrir solo puertos necesarios
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

2. **Secrets**: NUNCA subas `.env.production` a Git

3. **Backups**: Configura backups automáticos de la base de datos

4. **Updates**: Mantén Docker y el sistema operativo actualizados

## Soporte

Para problemas o dudas, contactar al equipo de desarrollo.
