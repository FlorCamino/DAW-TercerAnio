import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectStatusEnum } from '../../../common/enums/project-status.enum';
import { Client } from '../../clients/entities/client.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatusEnum,
    default: ProjectStatusEnum.ACTIVO,
  })
  status!: ProjectStatusEnum;

  @ManyToOne(() => Client, (client) => client.projects, {
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

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}