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
    
    const usuarios = [
        {
            nombre: "micazalazar",
            clave: bcrypt.hashSync("mica123456", 10),
            rol: UserRole.ADMIN,
            estado: UserStatus.ACTIVO,
        },
        {
            nombre: "usuariotest",
            clave: bcrypt.hashSync("usuariotest123", 10),
            rol: UserRole.USER,
            estado: UserStatus.ACTIVO,
        },
    ];

    for (const u of usuarios) {
        const existe = await userRepo.findOne({ where: { nombre: u.nombre } });
        if (!existe) {
            await userRepo.save(userRepo.create(u));
            console.log(`Usuario creado: ${u.nombre} - Rol: ${u.rol}`);
        } else {
            console.log(`El usuario ${u.nombre} ya existe`);
        }
    }

    console.log("Creación de usuarios de testeo finalizada");
    await app.close();
}

bootstrap();