import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ember_plate_super_secret_jwt_key_98371982';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is missing or invalid.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token has expired or is invalid.',
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRole = req.user.role?.toUpperCase();
    if (userRole === 'ADMIN' || allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Forbidden',
      message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
    });
  };
};

