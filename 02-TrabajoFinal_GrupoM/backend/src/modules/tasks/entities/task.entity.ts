import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Project } from '../../projects/entities/project.entity';
import { TaskStatus } from '../../../common/enums/task-status.enum';

@Entity('tasks')
export class Task {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ManyToOne(() => Project, { eager: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}