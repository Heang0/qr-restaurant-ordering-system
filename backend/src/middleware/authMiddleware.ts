import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    storeId?: string;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
      }

      req.user = user as { userId: string; role: string; storeId?: string };
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: Missing token' });
  }
};
