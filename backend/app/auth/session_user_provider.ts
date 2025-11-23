import { prisma } from "#start/prisma";
import { symbols } from "@adonisjs/auth";
import { SessionGuardUser, SessionUserProviderContract } from "@adonisjs/auth/types/session";
import { User } from "@prisma/client";



export class FakeUserProvider implements SessionUserProviderContract<User> {
    declare [symbols.PROVIDER_REAL_USER]: User

    constructor(private fakeUser: User) {
        console.log("FakeUserProvider initialized with user:", fakeUser);
    }

    async createUserForGuard(user: User): Promise<SessionGuardUser<User>> {
        console.log("Creating user for guard:", user);
        return {
            getId() {
                return user.id;
            },
            getOriginal() {
                return user;
            }
        }
    }

    async findById(identifier: number): Promise<SessionGuardUser<User> | null> {
        console.log("FakeUserProvider: Returning fake user");
        return await this.createUserForGuard(this.fakeUser);
    }
}


export class PrismaUserProvider implements SessionUserProviderContract<User> {
    declare [symbols.PROVIDER_REAL_USER]: User

    async createUserForGuard(user: User): Promise<SessionGuardUser<User>> {
        return {
            getId() {
                return user.id;
            },
            getOriginal() {
                return user;
            }
        }
    }

    async findById(identifier: number): Promise<SessionGuardUser<User> | null> {
        const user = await prisma.user.findUnique({
            where: { id: identifier },
        });

        return user ? await this.createUserForGuard(user) : null;
    }
}