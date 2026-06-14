import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Session } from "./entities/session.entity";
import { UserModule } from "../users/users.module";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Session]),
        forwardRef(() => UserModule),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthGuard,
        RolesGuard,
    ],
    exports: [
        AuthService,
        AuthGuard,
        RolesGuard,
    ],
})
export class AuthModule { }