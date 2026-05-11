import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseConfig } from './config/database.config';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    ClientsModule,
    ProjectsModule
  ],
  controllers: [AppController],
})
export class AppModule {}
