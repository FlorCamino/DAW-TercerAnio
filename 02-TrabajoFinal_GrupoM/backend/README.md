# 📌 Sistema de Gestión de Proyectos - Equipo M

Sistema de gestión de proyectos desarrollado como Trabajo Final Integrador para la materia **Desarrollo de Aplicaciones Web (2026)**.

---

## 👥 Integrantes del equipo

- Janet Casaretto  
- Damian Ottone  
- Micaela Zalazar  
- Franco Challiol  
- Florencia Camino  

---

## 🛠️ Tecnologías utilizadas

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Node.js

### Frontend
- Angular

### Otros
- Nginx
- PM2

---

## 📂 Estructura del proyecto

```

backend/
├── src/
│   ├── config/
│   ├── common/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── clients/
│   │   ├── projects/
│   │   └── tasks/
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json

```

---

## ⚙️ Configuración del entorno

Crear un archivo `.env` en la carpeta `backend`:

```

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=project_manager

```

---

## 🚀 Instalación y ejecución

### 1. Ir al backend

```

cd backend

```

### 2. Instalar dependencias

```

npm install

```

### 3. Ejecutar la aplicación

```

npm run start:dev

```

Servidor disponible en:

```

[http://localhost:3000/api](http://localhost:3000/api)

```