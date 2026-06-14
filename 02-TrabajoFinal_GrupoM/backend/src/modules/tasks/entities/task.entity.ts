import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { TaskStatusEnum } from '../../../common/enums/task-status.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'description', length: 255 })
  description!: string;

  @Column({
    type: 'varchar',
    default: TaskStatusEnum.PENDIENTE,
  })
  status!: TaskStatusEnum;

  @Column({ name: 'projectId', type: 'int' })
  projectId!: number;

  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: false,
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}
