import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { ClientStatusEnum } from '../../../../common/enums/client-status.enum';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional({ enum: ClientStatusEnum, example: ClientStatusEnum.ACTIVO })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(ClientStatusEnum, { message: 'El estado del cliente no es válido' })
  status?: ClientStatusEnum;
}
