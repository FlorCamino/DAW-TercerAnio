import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
    })
    nombre!: string;

    @Column()
    clave!: string;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVO,
    })
    estado!: UserStatus;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    rol!: UserRole;
}