import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    // Basic error handler for development; replace with richer handling later
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : 'Internal Server Error';
    // Keep error details out of production responses
    res.status(status).json({ error: message });
}
