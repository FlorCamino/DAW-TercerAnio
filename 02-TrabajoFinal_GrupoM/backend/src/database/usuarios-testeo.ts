import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../modules/users/entities/user.entity";
import { UserRole } from "../common/enums/user-role.enum";
import { UserStatus } from "../common/enums/user-status.enum";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });

    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

    console.log("Iniciando creación de usuarios de testeo");

    const users = [
        {
            name: "micazalazar",
            password: bcrypt.hashSync("mica123456", 10),
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVO,
        },
        {
            name: "usuariotest",
            password: bcrypt.hashSync("usuariotest123", 10),
            role: UserRole.USER,
            status: UserStatus.ACTIVO,
        },
    ];

    for (const u of users) {
        const existe = await userRepo.findOne({ where: { name: u.name } });
        if (!existe) {
            await userRepo.save(userRepo.create(u));
            console.log(`Usuario creado: ${u.name} - Rol: ${u.role}`);
        } else {
            console.log(`El usuario ${u.name} ya existe`);
        }
    }

    console.log("Creación de usuarios de testeo finalizada");
    await app.close();
}

bootstrap();