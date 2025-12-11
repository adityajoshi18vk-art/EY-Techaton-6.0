import { Router, Request, Response } from 'express';

export const presenceRouter = Router();

interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage?: string;
  lastActive: string;
  avatar?: string;
}

const mockPresence: UserPresence[] = [
  {
    userId: 'U001',
    userName: 'Admin User',
    status: 'online',
    currentPage: '/dashboard',
    lastActive: new Date().toISOString(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    userId: 'U002',
    userName: 'Service Manager',
    status: 'online',
    currentPage: '/dashboard/booking',
    lastActive: new Date(Date.now() - 60000).toISOString(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
  },
  {
    userId: 'U003',
    userName: 'Analytics Lead',
    status: 'away',
    currentPage: '/dashboard/analytics',
    lastActive: new Date(Date.now() - 300000).toISOString(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Analytics'
  }
];

// GET /api/presence - Get all user presence
presenceRouter.get('/presence', (req: Request, res: Response) => {
  res.json({
    users: mockPresence,
    summary: {
      online: mockPresence.filter(u => u.status === 'online').length,
      away: mockPresence.filter(u => u.status === 'away').length,
      busy: mockPresence.filter(u => u.status === 'busy').length,
      offline: mockPresence.filter(u => u.status === 'offline').length
    }
  });
});
