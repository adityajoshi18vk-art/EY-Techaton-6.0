import { Router, Request, Response } from 'express';
import { z } from 'zod';

export const authRouter = Router();

type UserRole = 'customer' | 'employee';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['customer', 'employee']).optional()
});

const demoUsers: Record<UserRole, User> = {
  employee: {
    id: 'E001',
    email: 'admin@codersadda.com',
    name: 'Admin Employee',
    role: 'employee'
  },
  customer: {
    id: 'C001',
    email: 'customer@example.com',
    name: 'John Customer',
    role: 'customer'
  }
};

// POST /api/login - Demo login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const requestedRole = validated.role || 'employee';
    
    // Demo authentication
    let authenticatedUser: User | null = null;
    
    if (validated.email === 'admin@codersadda.com' && validated.password === 'admin123' && requestedRole === 'employee') {
      authenticatedUser = demoUsers.employee;
    } else if (validated.email === 'customer@example.com' && validated.password === 'customer123' && requestedRole === 'customer') {
      authenticatedUser = demoUsers.customer;
    }
    
    if (authenticatedUser) {
      const token = `demo-token-${authenticatedUser.role}-${Date.now()}`;
      
      res.json({
        success: true,
        token,
        user: authenticatedUser,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials or role mismatch'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid login data', details: error.errors });
    }
    throw error;
  }
});

// GET /api/me - Get current user (demo)
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Extract role from token (demo implementation)
  const token = authHeader.split(' ')[1];
  const isCustomerToken = token.includes('customer');
  const user = isCustomerToken ? demoUsers.customer : demoUsers.employee;
  
  res.json({ user });
});
