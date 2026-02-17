# 🚀 Base Stack Template: Angular + Go + Postgres

Esta es la **plantilla maestra** para los proyectos de CheBot.

El objetivo de este repositorio es ahorrar tiempo de configuración. Ya incluye la conexión entre Frontend, Backend y Base de Datos, todo containerizado con Docker, listo para clonar y empezar a programar la lógica de negocio inmediatamente.

## 🛠️ Tech Stack

* **Frontend:** Angular 17+ (Servido con Nginx en producción)
* **Backend:** Go (Golang 1.21+) - Estructura estándar `cmd/internal`
* **Base de Datos:** PostgreSQL 15
* **Infraestructura:** Docker & Docker Compose

---

## 📋 Requisitos Previos

Para ejecutar este proyecto, solo necesitas tener instalado:

1.  **Docker Desktop** (Debe estar abierto y corriendo).
2.  **Git**.

*(Opcional: Tener Go y Node.js instalados localmente ayuda a que el editor de código te de autocompletado, pero no es estrictamente necesario para correr la app).*

---

## ⚡ Guía Rápida: Empezar un Nuevo Proyecto

Sigue estos pasos cuando quieras usar esta plantilla para crear un nuevo producto o servicio.

### 1. Clonar / Crear el Repositorio
Dirigite a la esquina superior derecha y dale al botón **"Use this template"**. Ahí podés asignarle un nombre al nuevo repo, el cual se creará con toda la estructura base.

### 2. Configurar Variables de Entorno
Por seguridad, el archivo de configuración real no se sube a Git. Debes crearlo basándote en el ejemplo:

```bash
# En terminal (Mac/Linux):
cp .env.example .env

# En Windows (PowerShell):
Copy-Item .env.example .env
```
> **Importante:** Abre el nuevo archivo `.env` y cambia las contraseñas o nombres de la DB si es necesario para el nuevo proyecto.

### 3. 🚀 Levantar todo con Docker
Este comando descargará las imágenes, compilará el Backend y el Frontend, e iniciará la Base de Datos.

```bash
docker-compose up --build
```
*(La primera vez tardará unos minutos. Ten paciencia).*

---

## 🔌 Puertos y Accesos

Una vez que la terminal diga que todo está corriendo, accede aquí:

| Servicio | URL Local | Descripción |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost](http://localhost) | La Web App (Angular) |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Tu API Rest en Go |
| **Base de Datos** | `localhost:5432` | Postgres (Usuario/Pass en tu .env) |

---

## 🔄 Paso Crítico: Renombrar el Módulo de Go

Cuando creas un proyecto nuevo, **debes cambiar el nombre del módulo en el backend**, si no, los imports seguirán apuntando al nombre de la plantilla.

1.  Ve a `backend/go.mod`.
2.  Cambia la primera línea:
    ```go
    // Antes
    module github.com/axelprz/backend-api

    // Ahora (Pon el nombre real del nuevo proyecto)
    module github.com/nuestro-equipo/nuevo-proyecto-x/backend
    ```
3.  Usa "Buscar y Reemplazar" en toda la carpeta `backend/` para actualizar los imports en tus archivos `.go`.

---

## 📂 Estructura del Proyecto

```text
.
├── backend/                # Código fuente API (Go)
│   ├── cmd/api/            # Entrypoint (main.go)
│   ├── internal/           # Lógica de negocio (Handlers, Models, etc)
│   ├── Dockerfile          # Configuración de build de Go
│   └── go.mod              # Dependencias
├── frontend/               # Código fuente Cliente (Angular)
│   ├── src/                # Componentes y servicios
│   ├── nginx.conf          # Configuración del servidor web
│   └── Dockerfile          # Configuración multi-stage
├── database/               # Scripts de DB
│   └── init.sql            # Se ejecuta solo la primera vez para crear tablas
├── .env.example            # Ejemplo de variables (público)
├── .gitignore              # Archivos ignorados (node_modules, .env, etc)
└── docker-compose.yml      # Orquestador de servicios
```

---

## 💡 Tips de Desarrollo Diarios

### Instalar nuevas dependencias
* **Backend:** Si agregas una librería en Go, ejecuta `docker-compose up --build backend` para reconstruir el contenedor con la nueva librería.
* **Frontend:** Si instalas un paquete npm, ejecuta `docker-compose up --build frontend`.

### Reiniciar la Base de Datos de cero
Si quieres borrar todos los datos y volver a crear las tablas limpias:

```bash
docker-compose down -v
docker-compose up --build
```
*(El flag `-v` borra el volumen de datos persistente).*

---
## 🤖 Integración Opcional: n8n (Automatización)

Si el proyecto requiere orquestar flujos de trabajo (workflows) o webhooks, esta plantilla está lista para integrar **n8n**.

Sigue estos pasos **solo si necesitas n8n**:

### 1. Preparar la Base de Datos
Edita el archivo `database/init.sql` y agrega esta línea al principio para crear una base de datos exclusiva para n8n:
```sql
CREATE DATABASE n8n;
```

### 2. Actualizar docker-compose.yml
Copia el siguiente bloque y pégalo en la sección `services` de tu `docker-compose.yml`:

```yaml
  n8n:
    image: n8nio/n8n
    container_name: emprendimiento-n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    depends_on:
      - db
    volumes:
      - n8n_data:/home/node/.n8n
```

### 3. Declarar el volumen
Al final del archivo `docker-compose.yml`, en la sección `volumes`, agrega:
```yaml
volumes:
  postgres_data:
  n8n_data: # <--- Agrega esta línea
```

Finalmente, ejecuta `docker-compose up -d`. Podrás acceder a n8n en `http://localhost:5678`.
