import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags, } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dtos/input/create-client.dto';
import { UpdateClientDto } from './dtos/input/update-client.dto';
import { ClientStatus } from '../../common/enums/client-status.enum';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Clients')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @ApiQuery({ name: 'status', enum: ClientStatus, required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phone', required: true })
  @ApiQuery({ name: 'page', required: true, example: 1, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', required: true, example: 6, schema: { default: 6 } })
  @ApiBadRequestResponse({
    description: 'No se encontraron clientes con los filtros ingresados',
  })
  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(
    @Query('status') status?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6',
  ) {
    return this.clientsService.findAll({
      status,
      name,
      email,
      phone,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear cliente' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modificar cliente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Dar de baja cliente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
