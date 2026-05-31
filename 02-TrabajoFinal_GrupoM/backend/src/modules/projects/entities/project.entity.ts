import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { Client } from '../../clients/entities/client.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus;

  @ManyToOne(() => Client, (client) => client.proyectos, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clientId' })
  client!: Client | null;

  @Column({ type: 'int', nullable: true })
  clientId!: number | null;

  @Column({ type: 'date', nullable: true })
  endDate!: string | null;
}