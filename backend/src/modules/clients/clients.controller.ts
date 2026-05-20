import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dtos/input/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

 @Post()
create(@Body() createClientDto: CreateClientDto) { 
  return this.clientsService.create(createClientDto);
}

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.clientsService.update(+id, dto);
  }
}