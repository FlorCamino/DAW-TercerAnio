import { ClientResponseDto } from '../dtos/output/client-response.dto';
import { Client } from '../entities/client.entity';

export class ClientsMapper {
  static toResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      nombre: client.nombre,
      estado: client.estado,
      email: client.email,
      telefono: client.telefono,
    };
  }
}
