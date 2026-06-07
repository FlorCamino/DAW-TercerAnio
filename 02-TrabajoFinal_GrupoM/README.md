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
* Sistema de roles: administrador y usuario.
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

### Filtros en listados - Janet Casaretto

Se agregaron filtros en los listados principales para mejorar la búsqueda y consulta de información. Según la pantalla, los filtros permiten buscar por nombre, estado, rol, teléfono, proyecto asociado, fechas y relaciones entre entidades.

### Sistema de roles - Micaela Zalazar

Se implementó un sistema de roles para diferenciar permisos dentro de la aplicación. Los usuarios administradores pueden acceder a las acciones de gestión principales, mientras que los usuarios comunes cuentan con permisos más limitados.

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

---

## Usuarios de prueba

La pantalla de login incluye usuarios de prueba para facilitar el acceso durante la corrección.

```text
Usuario: micazalazar
Contraseña: mica123456
Rol: Administrador
```

```text
Usuario: usuariotest
Contraseña: usuariotest123
Rol: Usuario
```

---

## Configuración inicial

Antes de ejecutar el proyecto, es necesario instalar las dependencias tanto en el backend como en el frontend.

### Backend

Ingresar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Cargar datos iniciales:

```bash
npm run seed
```

Ejecutar el backend en modo desarrollo:

```bash
npm run start:dev
```

El backend queda disponible en:

```text
http://localhost:3000/api/v1
```

> Importante: para realizar la corrección con datos de prueba, ejecutar `npm run seed` dentro de la carpeta `backend`.

---

### Frontend

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
