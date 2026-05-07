import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'janetcasaretto',
      password: '',
      database: 'tfi_individual',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule,
  ],
})
export class AppModule {}