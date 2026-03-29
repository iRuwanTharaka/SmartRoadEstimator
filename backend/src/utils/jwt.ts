import jwt from 'jsonwebtoken';
import { env } from '../config';

interface TokenPayload {
    userId: string;
    role: string;
}

export function signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}
