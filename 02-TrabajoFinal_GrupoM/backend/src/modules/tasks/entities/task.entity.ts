import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { TaskStatus } from '../../../common/enums/task-status.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'description', length: 255 })
  description!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({ name: 'projectId', type: 'int' })
  projectId!: number;

  @ManyToOne(() => Project, (project) => project.tasks, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}
