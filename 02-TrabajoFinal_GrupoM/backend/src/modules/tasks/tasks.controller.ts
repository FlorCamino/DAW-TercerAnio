import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.tasksService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tasksService.remove(id);
  }
}