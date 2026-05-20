import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { Client } from '../../clients/entities/client.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @ManyToOne(() => Client, { nullable: true, eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client | null;

  @Column({ type: 'int', nullable: true })
  clientId: number | null;
}