import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = () => ({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'janetcasaretto', // TU USUARIO
  password: '',               // TU CLAVE (vacío en Postgres.app)
  database: 'tfi_individual', // TU BASE DE DATOS
  autoLoadEntities: true,
  synchronize: true,
});