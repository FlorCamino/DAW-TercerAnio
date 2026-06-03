import { ClientStatus } from '../../../../common/enums/client-status.enum';

export class ClientResponseDto {
  id!: number;
  name!: string;
  status!: ClientStatus;
  email!: string | null;
  phone!: string | null;
}
