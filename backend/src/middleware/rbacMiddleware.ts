import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authMiddleware.js';

/**
 * Middleware to enforce Role-Based Access Control (RBAC) and Tenant Isolation.
 * Ensures the user has the correct role and can only modify data belonging to their store.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Missing user context' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

/**
 * Ensures the storeId in the request body/query/params matches the user's storeId.
 * Superadmins can bypass this check.
 */
export const requireStoreOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Missing user context' });
  }

  if (req.user.role === 'superadmin') {
    return next(); // Superadmins can access any store
  }

  // Extract storeId from possible locations in the request
  const requestStoreId = req.body.storeId || req.query.storeId || req.params.storeId;

  if (!requestStoreId) {
    return res.status(400).json({ message: 'Bad Request: storeId is required for this operation' });
  }

  if (requestStoreId !== req.user.storeId) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to modify data for this store' });
  }

  next();
};
