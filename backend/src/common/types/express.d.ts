import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: Role;
      isActive: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}
