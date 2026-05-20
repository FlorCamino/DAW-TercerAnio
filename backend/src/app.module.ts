import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Aquí ya no habrá error porque es directo
      host: 'localhost',
      port: 5432,
      username: 'janetcasaretto',
      password: '',
      database: 'tfi_individual',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule,
    ProjectsModule
  ],
  controllers: [AppController],
})
export class AppModule {}