import { ClientStatus } from '../../../../common/enums/client-status.enum';

export class ClientResponseDto {
  id: number;
  nombre: string;
  estado: ClientStatus;
  email: string | null;
  telefono: string | null;
}
