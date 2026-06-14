import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatusEnum } from '../../../common/enums/user-status.enum';
import { UserRoleEnum } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
    })
    name!: string;

    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: UserStatusEnum,
        default: UserStatusEnum.ACTIVO,
    })
    status!: UserStatusEnum;

    @Column({
        type: 'enum',
        enum: UserRoleEnum,
        default: UserRoleEnum.USER,
    })
    role!: UserRoleEnum;
}