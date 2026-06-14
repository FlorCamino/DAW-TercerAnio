import { ClientStatusEnum } from '../../../../common/enums/client-status.enum';

export class ClientResponseDto {
  id!: number;
  name!: string;
  status!: ClientStatusEnum;
  email!: string | null;
  phone!: string | null;
}
