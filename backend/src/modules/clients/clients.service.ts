import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientStatus } from '../../common/enums/client-status.enum';
import { CreateClientDto } from './dtos/input/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private readonly repo: Repository<Client>) {}

  create(dto: CreateClientDto) {
  const nuevo = this.repo.create({
    ...dto,
    estado: dto.estado || ClientStatus.ACTIVO 
  });
  return this.repo.save(nuevo);
}

  findAll() {
    return this.repo.find();
  }

  async remove(id: number) {
    return this.repo.update(id, { estado: ClientStatus.BAJA });
  }

  update(id: number, dto: any) {
    return this.repo.update(id, dto);
  }
}