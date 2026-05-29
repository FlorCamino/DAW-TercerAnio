import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dtos/input/create-client.dto';
import { UpdateClientDto } from './dtos/input/update-client.dto';
import { ClientStatus } from '../../common/enums/client-status.enum';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiBody({
    type: CreateClientDto,
    examples: {
      crearCliente: {
        summary: 'Crear cliente activo',
        value: {
          nombre: 'Janet Casaretto',
          email: 'janet@mail.com',
          telefono: '123456789',
        },
      },
    },
  })
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ApiQuery({ name: 'estado', enum: ClientStatus, required: false })
  @ApiQuery({ name: 'busqueda', required: false })
  @ApiQuery({ name: 'nombre', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'telefono', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  @ApiBadRequestResponse({
    description: 'No se encontraron clientes con los filtros ingresados',
  })
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('busqueda') busqueda?: string,
    @Query('nombre') nombre?: string,
    @Query('email') email?: string,
    @Query('telefono') telefono?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clientsService.findAll({
      estado,
      busqueda,
      nombre,
      email,
      telefono,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }

  @ApiBody({
    type: UpdateClientDto,
    examples: {
      editarCliente: {
        summary: 'Modificar datos del cliente',
        value: {
          nombre: 'Janet Casaretto',
          email: 'janet@mail.com',
          telefono: '123456789',
          estado: ClientStatus.ACTIVO,
        },
      },
    },
  })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}
