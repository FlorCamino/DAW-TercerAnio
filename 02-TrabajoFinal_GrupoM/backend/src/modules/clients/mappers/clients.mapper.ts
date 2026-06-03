import { ClientResponseDto } from '../dtos/output/client-response.dto';
import { Client } from '../entities/client.entity';

export class ClientsMapper {
  static toResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      status: client.status,
      email: client.email,
      phone: client.phone,
    };
  }
}
