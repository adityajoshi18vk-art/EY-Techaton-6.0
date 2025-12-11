import { Router, Request, Response } from 'express';
import { z } from 'zod';

export const diagnosticsRouter = Router();

interface DiagnosticResult {
  id: string;
  vehicleId: string;
  vin: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  issue: string;
  description: string;
  recommendation: string;
  estimatedCost?: number;
  predictedFailureDate?: string;
}

const mockDiagnostics: DiagnosticResult[] = [
  {
    id: 'D001',
    vehicleId: 'V002',
    vin: 'VIN-4567890',
    timestamp: new Date().toISOString(),
    severity: 'warning',
    issue: 'Catalytic Converter Efficiency Below Threshold',
    description: 'Error code P0420 detected. Catalytic converter not operating efficiently.',
    recommendation: 'Schedule inspection within 2 weeks',
    estimatedCost: 1200,
    predictedFailureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'D002',
    vehicleId: 'V002',
    vin: 'VIN-4567890',
    timestamp: new Date().toISOString(),
    severity: 'warning',
    issue: 'Fuel System Too Lean',
    description: 'Error code P0171 detected. Air-fuel mixture is too lean.',
    recommendation: 'Check for vacuum leaks and clean mass airflow sensor',
    estimatedCost: 350
  },
  {
    id: 'D003',
    vehicleId: 'V001',
    vin: 'VIN-7891234',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: 'info',
    issue: 'Tire Pressure Low',
    description: 'Rear-left tire pressure below recommended level.',
    recommendation: 'Inflate tire to 32 PSI',
    estimatedCost: 0
  },
  {
    id: 'D004',
    vehicleId: 'V003',
    vin: 'VIN-1234567',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    severity: 'critical',
    issue: 'Brake Pad Wear',
    description: 'Front brake pads at 10% remaining. Immediate service required.',
    recommendation: 'Replace brake pads immediately',
    estimatedCost: 450,
    predictedFailureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const diagnosticRequestSchema = z.object({
  vehicleId: z.string().min(1),
  symptoms: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional()
});

// GET /api/diagnostics - Get all diagnostic results
diagnosticsRouter.get('/diagnostics', (req: Request, res: Response) => {
  const severity = req.query.severity as string | undefined;
  
  let filtered = mockDiagnostics;
  if (severity) {
    filtered = mockDiagnostics.filter(d => d.severity === severity);
  }
  
  res.json({
    diagnostics: filtered,
    summary: {
      total: mockDiagnostics.length,
      critical: mockDiagnostics.filter(d => d.severity === 'critical').length,
      warnings: mockDiagnostics.filter(d => d.severity === 'warning').length,
      info: mockDiagnostics.filter(d => d.severity === 'info').length
    }
  });
});

// POST /api/diagnostics - Run diagnostics on a vehicle
diagnosticsRouter.post('/diagnostics', (req: Request, res: Response) => {
  try {
    const validated = diagnosticRequestSchema.parse(req.body);
    
    // Simulate diagnostic analysis
    const newDiagnostic: DiagnosticResult = {
      id: `D${Date.now()}`,
      vehicleId: validated.vehicleId,
      vin: `VIN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      severity: validated.urgency === 'high' ? 'critical' : 'info',
      issue: 'Diagnostic Scan Completed',
      description: `Comprehensive scan for vehicle ${validated.vehicleId}. ${validated.symptoms?.length || 0} symptoms analyzed.`,
      recommendation: 'No immediate action required. Continue monitoring.',
      estimatedCost: 0
    };
    
    mockDiagnostics.unshift(newDiagnostic);
    
    res.status(201).json({
      success: true,
      diagnostic: newDiagnostic,
      message: 'Diagnostic analysis completed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    throw error;
  }
});
