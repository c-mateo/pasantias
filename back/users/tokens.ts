import { eq } from "drizzle-orm";
import { db } from "./database";
import { sessionTokens, users } from "./schema";
import type { StringValue } from "ms";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { secret } from "encore.dev/config";

export const ISSUER = "drizzle";
export const SESSION_EXPIRATION = "5 min";
export const REFRESH_EXPIRATION = "3 days";

function generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return { privateKey, publicKey }
}

const fallbackKeyPair = generateKeyPair();

const publicKey = decodeURIComponent(secret("PUBLIC_KEY")) || fallbackKeyPair.publicKey;
const privateKey = decodeURIComponent(secret("PRIVATE_KEY")) || fallbackKeyPair.privateKey;

export interface DecodedToken extends jwt.JwtPayload {
    id: string;
    userID: number;
}

export async function getSessionTokens(userId: number) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            tokens: true
        }
    });
    if (!user) throw new Error("User not found");
    return user.tokens;
}

function generateToken(id: string, userID: number, duration: StringValue) {
    const options : jwt.SignOptions = {
        expiresIn: duration,
        issuer: ISSUER,
        algorithm: "RS256"
    }
    const jwtString = jwt.sign({ id, userID }, privateKey, options);
    return jwtString
}

export async function createToken(userID: number, duration: StringValue) {
    const [entry] = await db.insert(sessionTokens).values({ userId: userID }).returning();
    return generateToken(entry.id, userID, duration);
}

export async function getVerificationToken(id: string) {
    return await db.query.sessionTokens.findFirst({
        where: eq(sessionTokens.id, id)
    });
}

export function verifyToken(token: string) {
    const verifyOptions : jwt.VerifyOptions = {
        issuer: ISSUER,
        algorithms: ["RS256"]
    }
    return jwt.verify(token, publicKey, verifyOptions) as DecodedToken;
}
export async function existsToken(id: string) {
    const token = await db.query.sessionTokens.findFirst({
        where: eq(sessionTokens.id, id)
    });
    return !!token;
}
export async function deleteToken(id: string) {
    await db.delete(sessionTokens).where(eq(sessionTokens.id, id));
}

