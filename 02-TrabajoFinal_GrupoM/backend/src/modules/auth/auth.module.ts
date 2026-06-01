import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Session } from "./entities/session.entity";
import { UserModule } from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Session]),
        forwardRef(() => UserModule),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],

    exports: [AuthService],
})
export class AuthModule {}