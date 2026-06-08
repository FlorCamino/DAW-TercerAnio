# Gestor de Proyectos - Grupo M

Proyecto final desarrollado por el **Grupo M** para la gestión integral de proyectos, clientes, tareas, usuarios y reportes administrativos.

La aplicación permite administrar las entidades principales del sistema, controlar estados, aplicar filtros de búsqueda, gestionar permisos por roles, visualizar indicadores generales desde un dashboard y generar reportes exportables para el seguimiento administrativo.

---

## Integrantes

| Integrante       | Extra desarrollado                 |
| ---------------- | ---------------------------------- |
| Janet Casaretto  | Filtros en listados                |
| Franco Challiol  | Reportes administrativos           |
| Damián Ottone    | Fecha de finalización de proyectos |
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

El proyecto está dividido en dos aplicaciones principales:

```text
02-TrabajoFinal_GrupoM/
|-- backend/
`-- frontend/
```

El **backend** contiene la lógica de negocio y expone la API REST del sistema. Está organizado por módulos, separando autenticación, usuarios, clientes, proyectos, tareas y reportes.

El **frontend** contiene la interfaz de usuario desarrollada en Angular. Está organizado por funcionalidades, incluyendo login, dashboard, usuarios, clientes, proyectos, tareas y reportes.

---

## Funcionalidades principales

* Inicio de sesión con usuarios de prueba.
* Navegación protegida mediante autenticación.
* Sistema de roles: administrador y usuario común.
* Gestión de usuarios.
* Gestión de clientes.
* Gestión de proyectos.
* Gestión de tareas.
* Dashboard con indicadores generales del sistema.
* Filtros dinámicos en los listados principales.
* Alertas visuales para operaciones exitosas y errores.
* Fecha de finalización para proyectos.
* Detección de proyectos vencidos o próximos a finalizar.
* Módulo de reportes administrativos.
* Impresión de reportes en PDF desde el navegador.
* Exportación de reportes en formato CSV.

---

## Extras desarrollados

### Dashboard - Florencia Camino

Se implementó un dashboard general que permite visualizar rápidamente el estado del sistema. Incluye indicadores sobre proyectos, clientes, tareas y usuarios, facilitando una lectura inicial de la información administrativa más importante.

El dashboard también permite identificar proyectos retrasados y próximos vencimientos, ayudando al usuario a detectar situaciones importantes apenas ingresa a la aplicación.

### Filtros en listados - Janet Casaretto

Se agregaron filtros en los listados principales para mejorar la búsqueda y consulta de información. Según la pantalla, los filtros permiten buscar por nombre, estado, rol, teléfono, proyecto asociado, fechas y relaciones entre entidades.

Esto permite trabajar con mayor comodidad cuando existen varios registros cargados en el sistema.

### Sistema de roles - Micaela Zalazar

Se implementó un sistema de roles para diferenciar permisos dentro de la aplicación.

El usuario administrador puede acceder a las acciones principales de gestión, mientras que el usuario común cuenta con permisos más limitados. Esta funcionalidad permite controlar el acceso a determinadas pantallas y operaciones.

### Reportes administrativos - Franco Challiol

Se incorporó un módulo de reportes en la ruta `/reportes`, orientado al análisis administrativo de la información cargada en el sistema.

Reportes disponibles:

* Resumen general del sistema.
* Proyectos agrupados por estado.
* Tareas agrupadas por estado.
* Tareas por estado filtradas por proyecto.
* Proyectos vencidos o próximos a finalizar.
* Clientes con proyectos asociados.

El módulo permite imprimir los reportes utilizando la vista imprimible del navegador y descargar la información seleccionada en formato CSV.

### Fecha de finalización de proyectos - Damian Ottone

Se incorporó el campo de fecha de finalización en los proyectos. Esta información permite realizar un mejor seguimiento administrativo y detectar proyectos vencidos o próximos a finalizar.

Este dato también es utilizado por el dashboard y por el módulo de reportes para mostrar información relevante sobre el estado temporal de los proyectos.

---

## Configuración inicial

Antes de ejecutar el proyecto, es necesario tener instalado:

* Node.js
* npm
* PostgreSQL
* Angular CLI, si no se encuentra instalado globalmente

El proyecto utiliza una base de datos PostgreSQL exclusiva para la aplicación, con el objetivo de evitar conflictos con otras bases de datos locales que pueda tener el evaluador.

---

## Base de datos

La base de datos utilizada por el proyecto se llama:

```text
gestor_proyectos_grupo_m
```

No es necesario crearla manualmente antes de ejecutar el sistema.

El script de carga inicial de datos se encarga de verificar si la base de datos existe. Si no existe, la crea automáticamente y luego carga los datos de prueba necesarios para la corrección.

> Importante: para que esto funcione correctamente, el archivo `.env` del backend debe tener configurado `DB_NAME=gestor_proyectos_grupo_m`.

---

## Variables de entorno del backend

Dentro de la carpeta `backend`, configurar el archivo `.env` con los datos de conexión a PostgreSQL.

Ejemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=gestor_proyectos_grupo_m
JWT_SECRET=gestor_proyectos_grupo_m_secret
```

> Importante: reemplazar `tu_password` por la contraseña local de PostgreSQL.

La variable más importante para la creación y carga inicial de datos es:

```env
DB_NAME=gestor_proyectos_grupo_m
```

El script `npm run seed` utiliza ese valor para crear la base de datos, en caso de que no exista, y luego insertar los datos iniciales.

La aplicación utiliza TypeORM. Si la opción `synchronize` está activa en la configuración del backend, las tablas necesarias se crearán automáticamente dentro de la base de datos indicada.

> Aclaración: `synchronize: true` crea o sincroniza las tablas, pero no crea por sí solo la base de datos PostgreSQL. En este proyecto, la creación inicial de la base se realiza desde el script de datos de prueba.

---

## Backend

Ingresar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Cargar los datos iniciales:

```bash
npm run seed
```

Este comando realiza las siguientes acciones:

```text
1. Verifica si existe la base de datos gestor_proyectos_grupo_m.
2. Si no existe, la crea automáticamente.
3. Inicializa la conexión del backend.
4. Crea o sincroniza las tablas mediante TypeORM.
5. Carga usuarios, clientes, proyectos y tareas de prueba.
```

Luego ejecutar el backend en modo desarrollo:

```bash
npm run start:dev
```

El backend queda disponible en:

```text
http://localhost:3000/api/v1
```

> Importante: para realizar la corrección con datos de prueba, ejecutar `npm run seed` dentro de la carpeta `backend` antes de levantar el frontend.

---

## Frontend

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

Para evitar errores al momento de levantar el sistema, se recomienda seguir este orden:

```text
1. Ingresar a la carpeta backend.
2. Configurar el archivo .env con DB_NAME=gestor_proyectos_grupo_m.
3. Instalar dependencias del backend con npm install.
4. Ejecutar npm run seed para crear la base y cargar los datos iniciales.
5. Ejecutar el backend con npm run start:dev.
6. Ingresar a la carpeta frontend.
7. Instalar dependencias del frontend con npm install.
8. Ejecutar el frontend con npm start.
9. Ingresar a http://localhost:4200.
```

---

## Usuarios de prueba

La pantalla de login incluye usuarios de prueba para facilitar el acceso durante la corrección.

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

En el **frontend**, se priorizó una interfaz administrativa simple, clara y consistente. Se reutilizaron estilos compartidos para las pantallas de gestión, tablas, botones, formularios, alertas y filtros, con el objetivo de mantener una experiencia visual uniforme en toda la aplicación.

En el **backend**, se trabajó con una arquitectura modular basada en NestJS. Cada dominio del sistema cuenta con sus propios controladores, servicios, entidades, DTOs y lógica correspondiente. Esta decisión facilita la organización del código, mejora la mantenibilidad y permite agregar nuevas funcionalidades de forma ordenada.

También se decidió incorporar validaciones, manejo de roles y endpoints específicos para reportes, separando la lógica administrativa de la lógica principal de gestión.

Para facilitar la corrección, se incorporó un script de datos de prueba que crea la base de datos si no existe y carga información inicial ficticia. De esta manera, el evaluador puede levantar el sistema sin cargar datos manualmente.

---

## Estado actual del proyecto

El sistema cuenta con las funcionalidades principales solicitadas para la entrega final:

* Autenticación.
* Gestión de usuarios.
* Gestión de clientes.
* Gestión de proyectos.
* Gestión de tareas.
* Control de roles.
* Filtros en listados.
* Alertas visuales.
* Dashboard.
* Reportes administrativos.
* Exportación e impresión de reportes.

Los reportes consumen endpoints propios del backend y permiten visualizar, imprimir y exportar la información seleccionada.
