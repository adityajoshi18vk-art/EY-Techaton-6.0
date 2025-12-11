import { Router, Request, Response } from 'express';

export const telemetryRouter = Router();

interface TelemetryData {
  vehicleId: string;
  vin: string;
  timestamp: string;
  speed: number;
  engineTemp: number;
  fuelLevel: number;
  batteryVoltage: number;
  tirePressure: { fl: number; fr: number; rl: number; rr: number };
  gpsLocation: { lat: number; lng: number };
  odometer: number;
  diagnosticCodes: string[];
}

const mockTelemetry: TelemetryData[] = [
  {
    vehicleId: 'V001',
    vin: 'VIN-7891234',
    timestamp: new Date().toISOString(),
    speed: 65,
    engineTemp: 95,
    fuelLevel: 72,
    batteryVoltage: 12.8,
    tirePressure: { fl: 32, fr: 32, rl: 30, rr: 31 },
    gpsLocation: { lat: 40.7128, lng: -74.0060 },
    odometer: 45230,
    diagnosticCodes: []
  },
  {
    vehicleId: 'V002',
    vin: 'VIN-4567890',
    timestamp: new Date().toISOString(),
    speed: 0,
    engineTemp: 72,
    fuelLevel: 25,
    batteryVoltage: 12.4,
    tirePressure: { fl: 28, fr: 32, rl: 31, rr: 32 },
    gpsLocation: { lat: 34.0522, lng: -118.2437 },
    odometer: 62890,
    diagnosticCodes: ['P0420', 'P0171']
  },
  {
    vehicleId: 'V003',
    vin: 'VIN-1234567',
    timestamp: new Date().toISOString(),
    speed: 45,
    engineTemp: 88,
    fuelLevel: 58,
    batteryVoltage: 13.1,
    tirePressure: { fl: 33, fr: 33, rl: 32, rr: 32 },
    gpsLocation: { lat: 41.8781, lng: -87.6298 },
    odometer: 28450,
    diagnosticCodes: []
  }
];

// GET /api/telemetry - Get all vehicle telemetry
telemetryRouter.get('/telemetry', (req: Request, res: Response) => {
  res.json({
    data: mockTelemetry,
    summary: {
      totalVehicles: mockTelemetry.length,
      activeVehicles: mockTelemetry.filter(v => v.speed > 0).length,
      vehiclesWithIssues: mockTelemetry.filter(v => v.diagnosticCodes.length > 0).length,
      averageFuelLevel: Math.round(
        mockTelemetry.reduce((sum, v) => sum + v.fuelLevel, 0) / mockTelemetry.length
      )
    }
  });
});

// GET /api/telemetry/:vehicleId - Get specific vehicle telemetry
telemetryRouter.get('/telemetry/:vehicleId', (req: Request, res: Response) => {
  const vehicle = mockTelemetry.find(v => v.vehicleId === req.params.vehicleId);
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  res.json(vehicle);
});
