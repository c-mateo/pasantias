import bcrypt from "bcryptjs";
import { db } from "./database";
import { sessionTokens, users } from "./schema";
import { eq } from "drizzle-orm";
import { UserRegistrationParams } from "./api";
import { createToken, deleteToken, existsToken, getVerificationToken, REFRESH_EXPIRATION, SESSION_EXPIRATION, verifyToken } from "./tokens";

type UserRegistrationDTO = Omit<UserRegistrationParams, 'password'> & {
    hash: string;
}

export type UserDTO = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    dni: number | null;
    hash: string;
    verified: boolean;
}

export const UserService = {
    async register(data: UserRegistrationParams) {
        const salt = bcrypt.genSaltSync(10);
        const { password, ...rest } = data;
        const hash = bcrypt.hashSync(password, salt)
        const user = await insertUser({
            ...rest,
            hash
        });
        return user;
    },

    async login(email: string, password: string) {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        const valid = await bcrypt.compare(password, user.hash);
        if (!valid) {
            throw new Error("Invalid password");
        }

        const sessionToken = await createToken(user.id, SESSION_EXPIRATION);
        const refreshToken = await createToken(user.id, REFRESH_EXPIRATION);
        return { sessionToken, refreshToken };
    },

    async logout(sessionToken: string, refreshToken: string) {
        const decodedSessionToken = verifyToken(sessionToken);
        const decodedRefreshToken = verifyToken(refreshToken);
        if (decodedSessionToken.userID !== decodedRefreshToken.userID) {
            throw new Error("Invalid tokens");
        }

        await deleteToken(decodedSessionToken.id);
        await deleteToken(decodedRefreshToken.id);
    },

    async refresh(sessionToken: string, refreshToken: string) {
        const decodedSessionToken = verifyToken(sessionToken);
        const decodedRefreshToken = verifyToken(refreshToken);
        if (decodedSessionToken.userID !== decodedRefreshToken.userID) {
            throw new Error("Invalid tokens");
        }

        const sessionTokenExists = await existsToken(decodedSessionToken.id);
        const refreshTokenExists = await existsToken(decodedRefreshToken.id);

        await db.delete(sessionTokens).where(eq(sessionTokens.id, decodedSessionToken.id));
        await db.delete(sessionTokens).where(eq(sessionTokens.id, decodedRefreshToken.id));

        if (!sessionTokenExists || !refreshTokenExists) {
            throw new Error("Invalid tokens");
        }

        const newSessionToken = await createToken(decodedSessionToken.userID, SESSION_EXPIRATION);
        const newRefreshToken = await createToken(decodedSessionToken.userID, REFRESH_EXPIRATION);
        return { newSessionToken, newRefreshToken };
    },

    async verifyUser(tokenID: string) {
        const token = await getVerificationToken(tokenID);
        if (!token) throw new Error("Token not found");

        const user = await getUserById(token.userId);
        if (!user) throw new Error("User not found");

        await db.update(users).set({ verified: true }).where(eq(users.id, token.userId));
        await deleteToken(tokenID);
    }
}

async function insertUser(data: UserRegistrationDTO): Promise<UserDTO> {
    const [user] = await db.insert(users).values(data).returning();
    return user
}

async function getUserByEmail(email: string): Promise<UserDTO> {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });
    if (!user) throw new Error("User not found");
    return user;
}

export async function getUserById(userId: number) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });
    if (!user) throw new Error("User not found");
    return user;
}

