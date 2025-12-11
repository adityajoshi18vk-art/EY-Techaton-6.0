import { Router, Request, Response } from 'express';

export const securityRouter = Router();

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'access' | 'authentication' | 'data-access' | 'compliance' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  action: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  details: string;
}

interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  lastAudit: string;
  nextAudit: string;
  score: number;
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'SE001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    eventType: 'anomaly',
    severity: 'medium',
    description: 'Unusual data access pattern detected',
    userId: 'USR-447',
    ipAddress: '192.168.1.145',
    action: 'Multiple API calls to customer data endpoint',
    status: 'monitoring',
    details: 'User accessed 50+ customer records in 5 minutes. Pattern differs from normal behavior.'
  },
  {
    id: 'SE002',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    eventType: 'authentication',
    severity: 'low',
    description: 'Failed login attempt',
    ipAddress: '203.0.113.42',
    action: 'Multiple failed password attempts',
    status: 'resolved',
    details: 'Account locked after 5 failed attempts. User successfully logged in after password reset.'
  },
  {
    id: 'SE003',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    eventType: 'compliance',
    severity: 'high',
    description: 'GDPR data retention policy check',
    userId: 'SYSTEM',
    ipAddress: 'internal',
    action: 'Data retention audit completed',
    status: 'resolved',
    details: '142 records flagged for deletion per 30-day retention policy. Automated cleanup executed.'
  },
  {
    id: 'SE004',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    eventType: 'access',
    severity: 'critical',
    description: 'Unauthorized access attempt',
    ipAddress: '198.51.100.78',
    action: 'Attempted to access admin panel',
    status: 'resolved',
    details: 'IP blocked. Access denied. Security team notified and investigated.'
  },
  {
    id: 'SE005',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    eventType: 'data-access',
    severity: 'low',
    description: 'Bulk data export',
    userId: 'USR-012',
    ipAddress: '192.168.1.89',
    action: 'Exported vehicle telemetry data',
    status: 'resolved',
    details: 'Authorized export of 500 records for analytics. Export logged and encrypted.'
  }
];

const mockComplianceStatus: ComplianceStatus[] = [
  {
    regulation: 'GDPR (General Data Protection Regulation)',
    status: 'compliant',
    lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    score: 95
  },
  {
    regulation: 'CCPA (California Consumer Privacy Act)',
    status: 'compliant',
    lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextAudit: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    score: 92
  },
  {
    regulation: 'ISO 27001 (Information Security)',
    status: 'at-risk',
    lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    score: 78
  },
  {
    regulation: 'HIPAA (Health Information Privacy)',
    status: 'compliant',
    lastAudit: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextAudit: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    score: 88
  }
];

// GET /api/security - Get security events
securityRouter.get('/security', (req: Request, res: Response) => {
  const severity = req.query.severity as string | undefined;
  const eventType = req.query.eventType as string | undefined;
  
  let filtered = mockSecurityEvents;
  
  if (severity) {
    filtered = filtered.filter(e => e.severity === severity);
  }
  
  if (eventType) {
    filtered = filtered.filter(e => e.eventType === eventType);
  }
  
  res.json({
    events: filtered,
    summary: {
      total: mockSecurityEvents.length,
      critical: mockSecurityEvents.filter(e => e.severity === 'critical').length,
      high: mockSecurityEvents.filter(e => e.severity === 'high').length,
      medium: mockSecurityEvents.filter(e => e.severity === 'medium').length,
      low: mockSecurityEvents.filter(e => e.severity === 'low').length,
      unresolved: mockSecurityEvents.filter(e => e.status !== 'resolved').length
    }
  });
});

// GET /api/security/compliance - Get compliance status
securityRouter.get('/security/compliance', (req: Request, res: Response) => {
  const overallScore = (
    mockComplianceStatus.reduce((sum, c) => sum + c.score, 0) / mockComplianceStatus.length
  ).toFixed(1);
  
  res.json({
    compliance: mockComplianceStatus,
    overview: {
      overallScore: parseFloat(overallScore),
      compliant: mockComplianceStatus.filter(c => c.status === 'compliant').length,
      atRisk: mockComplianceStatus.filter(c => c.status === 'at-risk').length,
      nonCompliant: mockComplianceStatus.filter(c => c.status === 'non-compliant').length,
      nextAudit: mockComplianceStatus
        .map(c => new Date(c.nextAudit))
        .sort((a, b) => a.getTime() - b.getTime())[0]
        .toISOString()
    }
  });
});

// GET /api/security/threats - Get threat intelligence
securityRouter.get('/security/threats', (req: Request, res: Response) => {
  res.json({
    threatLevel: 'moderate',
    activeThreats: 2,
    blockedAttacks: 47,
    suspiciousActivities: 12,
    recentThreats: [
      {
        type: 'SQL Injection Attempt',
        count: 8,
        status: 'blocked',
        lastSeen: new Date(Date.now() - 3600000).toISOString()
      },
      {
        type: 'Brute Force Attack',
        count: 23,
        status: 'blocked',
        lastSeen: new Date(Date.now() - 7200000).toISOString()
      },
      {
        type: 'DDoS Attempt',
        count: 5,
        status: 'mitigated',
        lastSeen: new Date(Date.now() - 14400000).toISOString()
      }
    ]
  });
});
