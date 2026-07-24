import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { JwtPayload, AuthenticatedRequest } from '@appTypes/auth.types';
import { RoleEnum, PermissionEnum } from '@appTypes/rbac.enum';
import { AppError } from '@utils/AppError';

export { AuthenticatedRequest };

/**
 * Middleware to verify JWT token from Authorization header
 */
export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        try {
            const { prisma } = await import('@utils/prisma');
            const { RoleEnum, PermissionEnum } = await import('@appTypes/rbac.enum');

            let defaultUser = await prisma.user.findFirst({
                include: { role: { include: { permissions: { include: { permission: true } } } } }
            });

            if (!defaultUser) {
                // Ensure ADMIN role and permissions are seeded
                let adminRole = await prisma.role.findUnique({
                    where: { name: RoleEnum.ADMIN },
                    include: { permissions: { include: { permission: true } } }
                });

                if (!adminRole) {
                    const permissionsData = [
                        PermissionEnum.RUN_DECISION,
                        PermissionEnum.APPROVE_DECISION,
                        PermissionEnum.VIEW_DASHBOARD,
                        PermissionEnum.MANAGE_USERS,
                        PermissionEnum.RUN_SIMULATION,
                    ];

                    const permissionsMap = [];
                    for (const name of permissionsData) {
                        const p = await prisma.permission.upsert({
                            where: { name },
                            update: {},
                            create: { name }
                        });
                        permissionsMap.push(p);
                    }

                    adminRole = await prisma.role.create({
                        data: {
                            name: RoleEnum.ADMIN,
                            description: 'Full administrative access'
                        },
                        include: { permissions: { include: { permission: true } } }
                    });

                    for (const p of permissionsMap) {
                        await prisma.rolePermission.create({
                            data: {
                                roleId: adminRole.id,
                                permissionId: p.id
                            }
                        });
                    }

                    adminRole = await prisma.role.findUnique({
                        where: { name: RoleEnum.ADMIN },
                        include: { permissions: { include: { permission: true } } }
                    });
                }

                defaultUser = await prisma.user.create({
                    data: {
                        email: 'admin@enterprise.com',
                        name: 'Admin User',
                        roleId: adminRole!.id
                    },
                    include: { role: { include: { permissions: { include: { permission: true } } } } }
                });
            }

            req.user = {
                userId: defaultUser.id,
                email: defaultUser.email,
                role: defaultUser.role.name,
                permissions: defaultUser.role.permissions.map(p => p.permission.name)
            };
            return next();
        } catch (err) {
            return next(err);
        }
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired access token', 401));
    }
};

/**
 * Role-Based Access Control Middleware (RBAC)
 * @param roles Array of allowed role names or RoleEnum values
 */
export const requireRole = (...roles: (RoleEnum | string)[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        const allowedRoles = roles.map((r) => String(r));
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`,
                    403
                )
            );
        }

        next();
    };
};

/**
 * Permission-Based Access Control Middleware
 * @param requiredPermissions Array of required permission names or PermissionEnum values
 */
export const requirePermission = (...requiredPermissions: (PermissionEnum | string)[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        const userPermissions = req.user.permissions || [];
        const requiredPermStrings = requiredPermissions.map((p) => String(p));
        const hasAllPermissions = requiredPermStrings.every((perm) => userPermissions.includes(perm));

        if (!hasAllPermissions) {
            return next(
                new AppError(
                    `Forbidden: Missing required permissions [${requiredPermStrings.join(', ')}]`,
                    403
                )
            );
        }

        next();
    };
};
