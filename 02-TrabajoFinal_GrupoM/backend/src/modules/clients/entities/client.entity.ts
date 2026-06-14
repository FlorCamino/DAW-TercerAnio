import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClientStatusEnum } from '../../../common/enums/client-status.enum';
import { Project } from '../../projects/entities/project.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: ClientStatusEnum,
    default: ClientStatusEnum.ACTIVO,
  })
  status!: ClientStatusEnum;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @OneToMany(() => Project, (project) => project.client)
  projects!: Project[];
}
