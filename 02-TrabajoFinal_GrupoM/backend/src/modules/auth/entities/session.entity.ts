import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("sessions")
export class Session {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true, name: "token" })
    token!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        name: "expires_at",
        default: () => "CURRENT_TIMESTAMP + INTERVAL '8 hours'",
    })
    expiresAt!: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}