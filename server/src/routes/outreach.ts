import { Router, Request, Response } from 'express';

export const outreachRouter = Router();

interface OutreachCampaign {
  id: string;
  title: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  targetSegment: string;
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: string;
  scheduledFor?: string;
  message: string;
}

const mockCampaigns: OutreachCampaign[] = [
  {
    id: 'C001',
    title: 'Spring Maintenance Reminder',
    type: 'email',
    status: 'completed',
    targetSegment: 'Vehicles due for service',
    recipientCount: 342,
    sentCount: 342,
    openRate: 68.5,
    clickRate: 24.3,
    conversionRate: 12.8,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Your vehicle is due for its spring maintenance check. Book now and get 15% off!'
  },
  {
    id: 'C002',
    title: 'Tire Safety Alert',
    type: 'sms',
    status: 'active',
    targetSegment: 'Low tire pressure detected',
    recipientCount: 28,
    sentCount: 28,
    openRate: 92.3,
    clickRate: 45.2,
    conversionRate: 18.5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Important: Your tire pressure is low. Visit us for a free check.'
  },
  {
    id: 'C003',
    title: 'Customer Satisfaction Survey',
    type: 'email',
    status: 'completed',
    targetSegment: 'Recent service customers',
    recipientCount: 156,
    sentCount: 156,
    openRate: 45.2,
    clickRate: 32.1,
    conversionRate: 28.4,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'How was your recent service experience? Share your feedback and help us improve!'
  },
  {
    id: 'C004',
    title: 'New Feature Announcement',
    type: 'push',
    status: 'scheduled',
    targetSegment: 'All active users',
    recipientCount: 1247,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    createdAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Exciting update! Now track your vehicle health in real-time with our new dashboard.'
  },
  {
    id: 'C005',
    title: 'Loyalty Program Invitation',
    type: 'email',
    status: 'active',
    targetSegment: 'High-value customers',
    recipientCount: 89,
    sentCount: 89,
    openRate: 78.9,
    clickRate: 56.7,
    conversionRate: 34.2,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'You\'re invited to join our VIP loyalty program with exclusive benefits!'
  }
];

// GET /api/outreach - Get all outreach campaigns
outreachRouter.get('/outreach', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  
  let filtered = mockCampaigns;
  if (status) {
    filtered = mockCampaigns.filter(c => c.status === status);
  }
  
  res.json({
    campaigns: filtered,
    summary: {
      total: mockCampaigns.length,
      active: mockCampaigns.filter(c => c.status === 'active').length,
      completed: mockCampaigns.filter(c => c.status === 'completed').length,
      scheduled: mockCampaigns.filter(c => c.status === 'scheduled').length,
      totalRecipients: mockCampaigns.reduce((sum, c) => sum + c.recipientCount, 0),
      averageOpenRate: (mockCampaigns.reduce((sum, c) => sum + c.openRate, 0) / mockCampaigns.length).toFixed(1),
      averageConversionRate: (mockCampaigns.reduce((sum, c) => sum + c.conversionRate, 0) / mockCampaigns.length).toFixed(1)
    }
  });
});

// GET /api/outreach/:id - Get specific campaign
outreachRouter.get('/outreach/:id', (req: Request, res: Response) => {
  const campaign = mockCampaigns.find(c => c.id === req.params.id);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json(campaign);
});
