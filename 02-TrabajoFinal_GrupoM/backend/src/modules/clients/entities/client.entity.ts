import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClientStatus } from '../../../common/enums/client-status.enum';
import { Project } from '../../projects/entities/project.entity';

@Entity('clientes')
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150, unique: true })
  nombre: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    name: 'estado',
    default: ClientStatus.ACTIVO,
  })
  estado: ClientStatus;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 30, nullable: true })
  telefono: string;

  @OneToMany(() => Project, (project) => project.client)
  proyectos!: Project[];
}
