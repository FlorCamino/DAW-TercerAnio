import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Client as PgClient } from "pg";
import * as dotenv from "dotenv";
import { Repository } from "typeorm";
import { AppModule } from "../app.module";
import { ClientStatusEnum } from "../common/enums/client-status.enum";
import { ProjectStatusEnum } from "../common/enums/project-status.enum";
import { TaskStatusEnum } from "../common/enums/task-status.enum";
import { UserRoleEnum } from "../common/enums/user-role.enum";
import { UserStatusEnum } from "../common/enums/user-status.enum";
import { Client } from "../modules/clients/entities/client.entity";
import { Project } from "../modules/projects/entities/project.entity";
import { Task } from "../modules/tasks/entities/task.entity";
import { User } from "../modules/users/entities/user.entity";

interface ClientePrueba {
  name: string;
  email: string;
  phone: string;
  status: ClientStatusEnum;
}

interface ProyectoPrueba {
  name: string;
  status: ProjectStatusEnum;
  clientName: string;
  endDate: string;
}

interface TareaPrueba {
  description: string;
  status: TaskStatusEnum;
  projectName: string;
}

async function crearBaseDeDatosSiNoExiste(): Promise<void> {
  const nombreBaseDatos = process.env.DB_NAME || "gestor_proyectos_grupo_m";

  if (!/^[a-zA-Z0-9_]+$/.test(nombreBaseDatos)) {
    throw new Error(
      "El nombre de la base de datos solo puede contener letras, números y guiones bajos",
    );
  }

  const clientePostgres = new PgClient({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: "postgres",
  });

  try {
    await clientePostgres.connect();

    const resultado = await clientePostgres.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [nombreBaseDatos],
    );

    if (resultado.rowCount === 0) {
      await clientePostgres.query(`CREATE DATABASE "${nombreBaseDatos}"`);
      console.log(`Base de datos creada: ${nombreBaseDatos}`);
    } else {
      console.log(`La base de datos ${nombreBaseDatos} ya existe`);
    }
  } catch (error) {
    console.error("Error al crear la base de datos", error);
    process.exit(1);
  } finally {
    await clientePostgres.end();
  }
}

async function bootstrap() {
  dotenv.config();

  await crearBaseDeDatosSiNoExiste();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const clientRepo = app.get<Repository<Client>>(getRepositoryToken(Client));
  const projectRepo = app.get<Repository<Project>>(getRepositoryToken(Project));
  const taskRepo = app.get<Repository<Task>>(getRepositoryToken(Task));

  console.log("Iniciando carga de datos de prueba");

  await cargarUsuarios(userRepo);
  await cargarClientes(clientRepo);
  await cargarProyectos(clientRepo, projectRepo);
  await cargarTareas(projectRepo, taskRepo);

  console.log("Carga de datos de prueba finalizada");

  await app.close();
}

async function cargarUsuarios(userRepo: Repository<User>): Promise<void> {
  const usuarios = [
    {
      name: "admin",
      password: bcrypt.hashSync("admin123456", 10),
      role: UserRoleEnum.ADMIN,
      status: UserStatusEnum.ACTIVO,
    },
    {
      name: "usuario",
      password: bcrypt.hashSync("usuario123456", 10),
      role: UserRoleEnum.USER,
      status: UserStatusEnum.ACTIVO,
    },
  ];

  for (const usuario of usuarios) {
    const existe = await userRepo.findOne({
      where: {
        name: usuario.name,
      },
    });

    if (!existe) {
      await userRepo.save(userRepo.create(usuario));
      console.log(`Usuario creado: ${usuario.name} - Rol: ${usuario.role}`);
    } else {
      console.log(`El usuario ${usuario.name} ya existe`);
    }
  }
}

async function cargarClientes(clientRepo: Repository<Client>): Promise<void> {
  const clientes: ClientePrueba[] = [
    {
      name: "Empresa Norte",
      email: "contacto@empresanorte.com",
      phone: "3434001001",
      status: ClientStatusEnum.ACTIVO,
    },
    {
      name: "Comercio Centro",
      email: "info@comerciocentro.com",
      phone: "3434001002",
      status: ClientStatusEnum.ACTIVO,
    },
    {
      name: "Servicios del Sur",
      email: "admin@serviciosdelsur.com",
      phone: "3434001003",
      status: ClientStatusEnum.ACTIVO,
    },
    {
      name: "Cliente Demo",
      email: "cliente@demo.com",
      phone: "3434001004",
      status: ClientStatusEnum.ACTIVO,
    },
    {
      name: "Cliente Anterior",
      email: "anterior@cliente.com",
      phone: "3434001005",
      status: ClientStatusEnum.BAJA,
    },
  ];

  for (const cliente of clientes) {
    const existe = await clientRepo.findOne({
      where: {
        name: cliente.name,
      },
    });

    if (!existe) {
      await clientRepo.save(clientRepo.create(cliente));
      console.log(`Cliente creado: ${cliente.name}`);
    } else {
      console.log(`El cliente ${cliente.name} ya existe`);
    }
  }
}

async function cargarProyectos(
  clientRepo: Repository<Client>,
  projectRepo: Repository<Project>,
): Promise<void> {
  const clientes = await clientRepo.find();

  const clientePorNombre = new Map(
    clientes.map((cliente) => [cliente.name, cliente]),
  );

  const proyectos: ProyectoPrueba[] = [
    {
      name: "Sistema de clientes",
      status: ProjectStatusEnum.ACTIVO,
      clientName: "Empresa Norte",
      endDate: "2026-07-15",
    },
    {
      name: "Pagina web institucional",
      status: ProjectStatusEnum.ACTIVO,
      clientName: "Comercio Centro",
      endDate: "2026-08-20",
    },
    {
      name: "Gestion de turnos",
      status: ProjectStatusEnum.ACTIVO,
      clientName: "Servicios del Sur",
      endDate: "2026-09-05",
    },
    {
      name: "Reporte mensual",
      status: ProjectStatusEnum.FINALIZADO,
      clientName: "Cliente Demo",
      endDate: "2026-05-30",
    },
    {
      name: "Proyecto anterior",
      status: ProjectStatusEnum.BAJA,
      clientName: "Cliente Anterior",
      endDate: "2026-04-10",
    },
    {
      name: "Tareas atrasadas",
      status: ProjectStatusEnum.ACTIVO,
      clientName: "Empresa Norte",
      endDate: "2026-06-01",
    },
  ];

  for (const proyecto of proyectos) {
    const existe = await projectRepo.findOne({
      where: {
        name: proyecto.name,
      },
    });

    if (!existe) {
      const cliente = clientePorNombre.get(proyecto.clientName) ?? null;

      await projectRepo.save(
        projectRepo.create({
          name: proyecto.name,
          status: proyecto.status,
          clientId: cliente?.id ?? null,
          client: cliente,
          endDate: proyecto.endDate,
        }),
      );

      console.log(`Proyecto creado: ${proyecto.name}`);
    } else {
      console.log(`El proyecto ${proyecto.name} ya existe`);
    }
  }
}

async function cargarTareas(
  projectRepo: Repository<Project>,
  taskRepo: Repository<Task>,
): Promise<void> {
  const proyectos = await projectRepo.find();

  const proyectoPorNombre = new Map(
    proyectos.map((proyecto) => [proyecto.name, proyecto]),
  );

  const tareas: TareaPrueba[] = [
    {
      description: "Revisar datos iniciales",
      status: TaskStatusEnum.FINALIZADO,
      projectName: "Sistema de clientes",
    },
    {
      description: "Crear formulario principal",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Sistema de clientes",
    },
    {
      description: "Probar listado de clientes",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Sistema de clientes",
    },
    {
      description: "Diseñar pantalla de inicio",
      status: TaskStatusEnum.FINALIZADO,
      projectName: "Pagina web institucional",
    },
    {
      description: "Agregar sección de contacto",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Pagina web institucional",
    },
    {
      description: "Configurar calendario",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Gestion de turnos",
    },
    {
      description: "Agregar aviso por correo",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Gestion de turnos",
    },
    {
      description: "Preparar datos del reporte",
      status: TaskStatusEnum.FINALIZADO,
      projectName: "Reporte mensual",
    },
    {
      description: "Generar reporte final",
      status: TaskStatusEnum.FINALIZADO,
      projectName: "Reporte mensual",
    },
    {
      description: "Archivar información anterior",
      status: TaskStatusEnum.BAJA,
      projectName: "Proyecto anterior",
    },
    {
      description: "Resolver tareas pendientes",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Tareas atrasadas",
    },
    {
      description: "Informar avance del proyecto",
      status: TaskStatusEnum.PENDIENTE,
      projectName: "Tareas atrasadas",
    },
  ];

  for (const tarea of tareas) {
    const proyecto = proyectoPorNombre.get(tarea.projectName);

    if (!proyecto) {
      console.log(`No se encontro el proyecto para la tarea: ${tarea.description}`);
      continue;
    }

    const existe = await taskRepo.findOne({
      where: {
        description: tarea.description,
        projectId: proyecto.id,
      },
    });

    if (!existe) {
      await taskRepo.save(
        taskRepo.create({
          description: tarea.description,
          status: tarea.status,
          projectId: proyecto.id,
          project: proyecto,
        }),
      );

      console.log(`Tarea creada: ${tarea.description}`);
    } else {
      console.log(`La tarea ${tarea.description} ya existe`);
    }
  }
}

bootstrap();
