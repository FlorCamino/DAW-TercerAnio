# Gestor de Proyectos - Grupo M

Proyecto final desarrollado por el **Grupo M** para la gestión administrativa de proyectos, clientes, tareas, usuarios y reportes.

La aplicación permite iniciar sesión, administrar las entidades principales del sistema, controlar estados, aplicar filtros, gestionar permisos por roles, visualizar indicadores desde un dashboard y generar reportes exportables.

---

## Video de presentación

[Ver video en YouTube](https://youtu.be/jwUARHTWkd0)

---

## Integrantes

| Integrante       | Extra desarrollado                 |
| ---------------- | ---------------------------------- |
| Janet Casaretto  | Filtros en listados                |
| Franco Challiol  | Reportes administrativos           |
| Damian Ottone    | Fecha de finalización de proyectos |
| Micaela Zalazar  | Sistema de roles                   |
| Florencia Camino | Dashboard                          |

---

## Tecnologías utilizadas

### Frontend

* Angular
* TypeScript
* PrimeNG
* PrimeIcons
* CSS compartido para pantallas de gestión
* Componentes reutilizables
* Rutas protegidas

### Backend

* NestJS
* TypeScript
* TypeORM
* PostgreSQL
* Swagger
* Validaciones con `class-validator`
* Arquitectura modular por dominio

---

## Estructura del proyecto

```text
02-TrabajoFinal_GrupoM/
|-- backend/
`-- frontend/
```

El proyecto está separado en dos aplicaciones:

* **backend**: contiene la API REST, la lógica de negocio, autenticación, usuarios, clientes, proyectos, tareas y reportes.
* **frontend**: contiene la interfaz de usuario desarrollada en Angular, incluyendo login, dashboard, gestión de entidades y reportes.

---

## Funcionalidades principales

* Inicio de sesión con usuarios de prueba.
* Navegación protegida mediante autenticación.
* Sistema de roles: administrador y usuario común.
* Gestión de usuarios, clientes, proyectos y tareas.
* Filtros dinámicos en los listados principales.
* Dashboard con indicadores generales.
* Fecha de finalización para proyectos.
* Detección de proyectos vencidos o próximos a finalizar.
* Reportes administrativos.
* Exportación de reportes en CSV.
* Impresión de reportes desde el navegador.
* Alertas visuales para operaciones exitosas y errores.

---

## Extras desarrollados

### Dashboard - Florencia Camino

Se implementó un dashboard general con indicadores sobre proyectos, clientes, tareas y usuarios. También permite identificar proyectos retrasados y próximos vencimientos.

### Filtros en listados - Janet Casaretto

Se agregaron filtros en los listados principales para facilitar la búsqueda de registros por nombre, estado, rol, teléfono, proyecto asociado, fechas y relaciones entre entidades.

### Sistema de roles - Micaela Zalazar

Se implementó un sistema de roles para diferenciar permisos entre el usuario administrador y el usuario común, limitando el acceso a determinadas pantallas y operaciones.

### Reportes administrativos - Franco Challiol

Se incorporó un módulo de reportes en la ruta `/reportes`, con reportes generales, proyectos por estado, tareas por estado, tareas por proyecto, proyectos vencidos o próximos a finalizar y clientes con proyectos asociados.

Los reportes pueden imprimirse desde el navegador y exportarse en formato CSV.

### Fecha de finalización de proyectos - Damian Ottone

Se agregó el campo de fecha de finalización en los proyectos. Este dato permite realizar seguimiento administrativo y es utilizado por el dashboard y los reportes.

---

## Configuración inicial

Antes de ejecutar el proyecto, es necesario tener instalado:

* Node.js
* npm
* PostgreSQL
* Angular CLI, si no se encuentra instalado globalmente

---

## Variables de entorno del backend

Dentro de la carpeta `backend`, crear o configurar el archivo `.env` con los datos de conexión a PostgreSQL.

Ejemplo:

```env
PORT=4000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=daw
DB_PASSWORD=2026
DB_NAME=gestor_proyectos_grupo_m
DB_LOGGING=true
SWAGGER_HABILITADO=true
SESSION_DURATION_HOURS=8
```

> Reemplazar `tu_password` por la contraseña local de PostgreSQL.

La base de datos utilizada por el proyecto es:

```text
gestor_proyectos_grupo_m
```

No es necesario crearla manualmente. El script de carga inicial verifica si la base de datos existe y, si no existe, la crea automáticamente.

---

## Ejecución del backend

Ingresar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear la base de datos y cargar datos iniciales:

```bash
npm run seed
```

Ejecutar el backend:

```bash
npm run start:dev
```

El backend queda disponible en:

```text
http://localhost:4000/api/v1
```

---

## Ejecución del frontend

Ingresar a la carpeta del frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el frontend:

```bash
npm start
```

El frontend queda disponible en:

```text
http://localhost:4200
```

---

## Orden recomendado de ejecución

```text
1. Configurar el archivo .env dentro de backend.
2. Ejecutar npm install dentro de backend.
3. Ejecutar npm run seed dentro de backend.
4. Ejecutar npm run start:dev dentro de backend.
5. Ejecutar npm install dentro de frontend.
6. Ejecutar npm start dentro de frontend.
7. Ingresar a http://localhost:4200.
```

---

## Usuarios de prueba

La pantalla de login incluye usuarios de prueba para facilitar la corrección.

```text
Usuario: admin
Contraseña: admin123456
Rol: Administrador
```

```text
Usuario: usuario
Contraseña: usuario123456
Rol: Usuario común
```

---

## Endpoints principales

La API utiliza el prefijo general:

```text
/api/v1
```

Módulos principales:

* `/auth`
* `/users`
* `/clients`
* `/projects`
* `/tasks`
* `/reports`

---

## Decisiones de diseño

El proyecto se dividió en **frontend** y **backend** para mantener una separación clara de responsabilidades.

En el frontend se priorizó una interfaz administrativa simple, clara y consistente, reutilizando estilos compartidos para tablas, formularios, filtros, botones y alertas.

En el backend se trabajó con una arquitectura modular basada en NestJS. Cada dominio cuenta con sus propios controladores, servicios, entidades y DTOs, lo que facilita la organización del código y permite agregar nuevas funcionalidades de forma ordenada.

También se incorporaron validaciones, control de roles y endpoints específicos para reportes, separando la lógica administrativa de la gestión principal del sistema.

---

## Estado actual del proyecto

El sistema cuenta con las funcionalidades principales solicitadas para la entrega final:

* Autenticación.
* Gestión de usuarios, clientes, proyectos y tareas.
* Control de roles.
* Filtros en listados.
* Dashboard.
* Reportes administrativos.
* Exportación e impresión de reportes.
