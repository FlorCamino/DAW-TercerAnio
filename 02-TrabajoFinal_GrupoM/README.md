# Gestor de Proyectos - Grupo M

Proyecto final desarrollado por el **Grupo M** para la gestion de proyectos, clientes, tareas y usuarios.

La aplicacion permite administrar las entidades principales del sistema, controlar estados, aplicar filtros, manejar roles, visualizar indicadores desde un dashboard y generar reportes administrativos.

## Integrantes

- Janet Casaretto
- Franco Challiol
- Damian Ottone
- Micaela Zalazar
- Florencia Camino

## Tecnologias

**Frontend**

- Angular
- TypeScript
- PrimeNG / PrimeIcons
- CSS compartido para pantallas de gestion

**Backend**

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger
- Validaciones con `class-validator`

## Estructura del proyecto

El proyecto esta dividido en dos aplicaciones:

```text
02-TrabajoFinal_GrupoM/
|-- backend/
`-- frontend/
```

El **backend** organiza la logica por modulos: autenticacion, usuarios, clientes, proyectos, tareas y reportes.

El **frontend** organiza las pantallas por features: login, dashboard, usuarios, clientes, proyectos, tareas y reportes.

## Funcionalidades principales

- Login con usuarios de prueba.
- Navegacion protegida por autenticacion.
- Sistema de roles: administrador y usuario.
- Dashboard con resumen general del sistema.
- Gestion de usuarios.
- Gestion de clientes.
- Gestion de proyectos.
- Gestion de tareas.
- Filtros por estado, nombre, rol, telefono, fechas y relaciones segun la pantalla.
- Alertas visuales para acciones exitosas y errores.
- Fecha de finalizacion para proyectos.
- Deteccion de proyectos vencidos o proximos a finalizar.
- Modulo de reportes administrativos.
- Exportacion/impresion de reportes en PDF desde el navegador.
- Descarga de reportes en CSV.

## Extras desarrollados

### Extra Flor: Dashboard

Se implemento un dashboard general que permite visualizar un resumen rapido del sistema, incluyendo proyectos, clientes, tareas y usuarios.

### Extra Janet: Filtros en listados

Se agregaron filtros en los listados principales para facilitar la busqueda de informacion. Los filtros permiten buscar por nombre, estado, rol, telefono, proyecto asociado y rango de fechas, segun corresponda.

### Extra Mica: Sistema de roles

Se implemento un sistema de roles para diferenciar permisos dentro de la aplicacion. Los usuarios administradores pueden realizar acciones de gestion, mientras que los usuarios comunes tienen acceso mas limitado.

### Extra Franco: Reportes

Se agrego un modulo de reportes en `/reportes` con informacion administrativa del sistema. Cada reporte muestra cantidades y detalle interno de los registros correspondientes.

Reportes disponibles:

- Resumen general del sistema.
- Proyectos por estado.
- Tareas por estado, con filtro por proyecto.
- Proyectos vencidos o proximos a finalizar.
- Clientes con proyectos asociados.

El modulo tambien permite:

- Imprimir PDF usando la vista imprimible del navegador.
- Descargar CSV del reporte seleccionado.

### Extra Damian: Fecha de finalizacion de proyecto

Se incorporo la fecha de finalizacion en los proyectos. Esta informacion se usa para el seguimiento administrativo y para detectar proyectos vencidos o proximos a finalizar.

## Usuarios de prueba

La pantalla de login incluye usuarios de prueba para facilitar el acceso durante la correccion.

Ejemplos:

```text
Usuario: micazalazar
Contrasena: mica123456
Rol: Administrador
```

```text
Usuario: usuariotest
Contrasena: usuariotest123
Rol: Usuario
```

## Configuracion inicial

Antes de ejecutar el proyecto, instalar las dependencias en cada carpeta.

### Backend

```bash
cd backend
npm install
```

Para cargar datos iniciales:

```bash
npm run seed
```

Para levantar el backend en modo desarrollo:

```bash
npm run start:dev
```

El backend queda disponible en:

```text
http://localhost:3000/api/v1
```

### Frontend

```bash
cd frontend
npm install
npm start
```

El frontend queda disponible en:

```text
http://localhost:4200
```

## Scripts utiles

### Backend

```bash
npm run build
npm run start:dev
npm run seed
```

### Frontend

```bash
npm run build
npm start
```

## Endpoints principales

La API usa el prefijo:

```text
/api/v1
```

Modulos principales:

- `/auth`
- `/users`
- `/clients`
- `/projects`
- `/tasks`
- `/reports`

Endpoints de reportes:

- `GET /api/v1/reports/summary`
- `GET /api/v1/reports/projects-by-status`
- `GET /api/v1/reports/tasks-by-status`
- `GET /api/v1/reports/tasks-by-status?projectId=1`
- `GET /api/v1/reports/project-deadlines`
- `GET /api/v1/reports/clients-projects`

## Decisiones de diseno

Se separo el proyecto en frontend y backend para mantener responsabilidades claras.

En frontend se priorizo una interfaz administrativa simple, con navegacion clara, formularios consistentes, alertas reutilizables y tablas orientadas a gestion.

En backend se trabajo con modulos independientes para cada dominio, separando controladores, servicios, entidades, DTOs y mappers. Esta estructura permite mantener el codigo organizado y facilita agregar nuevas funcionalidades.

## Estado actual

El sistema cuenta con las pantallas principales de gestion, autenticacion, filtros, alertas, dashboard y reportes. Los reportes ya consumen endpoints propios del backend y permiten imprimir/exportar la informacion seleccionada.
