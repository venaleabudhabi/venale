import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.error('[Auth] No user found in request');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.error(`[Auth] User ${req.user.email} has role '${req.user.role}', required: ${roles.join(', ')}`);
      return res.status(403).json({ error: `Insufficient permissions. Required role: ${roles.join(' or ')}` });
    }
    
    next();
  };
};
