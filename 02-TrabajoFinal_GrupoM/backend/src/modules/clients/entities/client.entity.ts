import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ClientStatus } from '../../../common/enums/client-status.enum';

@Entity('clientes')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true }) 
  nombre: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    name: 'estado', 
    })
  estado: ClientStatus;


  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;
}
