import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project]), // 👈 AQUÍ ESTÁ EL FIX
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}