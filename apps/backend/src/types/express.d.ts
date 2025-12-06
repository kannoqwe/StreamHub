import { JwtPayload } from './auth.types';

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
            cookies: Record<string, string>;
        }
    }
}

export {};
