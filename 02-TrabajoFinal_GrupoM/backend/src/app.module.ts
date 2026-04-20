import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import databaseConfig from './config/database.config';
// import { envValidationSchema } from './config/env.validation';
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { ClientsModule } from './modules/clients/clients.module';
// import { ProjectsModule } from './modules/projects/projects.module';
// import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validationSchema: envValidationSchema,
    }),
    // TypeOrmModule.forRoot(databaseConfig()),
    // AuthModule,
    // UsersModule,
    // ClientsModule,
    // ProjectsModule,
    // TasksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}