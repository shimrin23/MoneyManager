import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message: string;
}

// Simple in-memory limiter: each IP gets `max` requests per `windowMs`.
// The count resets when the backend restarts. Fine for local testing; use a shared store in production.
export const rateLimit = ({ windowMs, max, message }: RateLimitOptions) => {
    const hits = new Map<string, { count: number; resetAt: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const entry = hits.get(key);

        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        entry.count += 1;
        if (entry.count > max) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            return res.status(429).json({ error: message });
        }
        next();
    };
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const loginLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: 20,
    message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
});

export const emailLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: 5,
    message: 'Too many requests. Please wait 15 minutes and try again.',
});

export const resetLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: 10,
    message: 'Too many password reset attempts. Please wait 15 minutes and try again.',
});
