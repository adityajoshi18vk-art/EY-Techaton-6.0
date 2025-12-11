import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB, isMongoConnected } from '../db/mongodb';
import { ObjectId } from 'mongodb';

export const bookingRouter = Router();

interface Booking {
  _id?: ObjectId;
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vin: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  estimatedDuration: number;
  estimatedCost: number;
  notes?: string;
  createdAt: string;
}

// In-memory fallback storage
const memoryBookings: Booking[] = [
  // Initial mock data for fallback
  {
    id: 'B001',
    customerId: 'CU001',
    customerName: 'John Smith',
    vehicleId: 'V001',
    vin: 'VIN-7891234',
    serviceType: 'Oil Change & Inspection',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '10:00',
    status: 'confirmed',
    location: 'Main Service Center - 123 Auto Blvd',
    estimatedDuration: 60,
    estimatedCost: 89,
    notes: 'Customer requested synthetic oil',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'B002',
    customerId: 'CU002',
    customerName: 'Sarah Johnson',
    vehicleId: 'V002',
    vin: 'VIN-4567890',
    serviceType: 'Brake Inspection & Repair',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '14:30',
    status: 'scheduled',
    location: 'Downtown Service Hub - 456 Motor St',
    estimatedDuration: 120,
    estimatedCost: 450,
    notes: 'Front brake pads replacement needed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'B003',
    customerId: 'CU003',
    customerName: 'Michael Chen',
    vehicleId: 'V003',
    vin: 'VIN-1234567',
    serviceType: 'Annual Maintenance',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    status: 'in-progress',
    location: 'Main Service Center - 123 Auto Blvd',
    estimatedDuration: 180,
    estimatedCost: 299,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'B004',
    customerId: 'CU004',
    customerName: 'Emily Brown',
    vehicleId: 'V004',
    vin: 'VIN-9876543',
    serviceType: 'Tire Rotation',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '15:00',
    status: 'completed',
    location: 'Express Service Lane - 789 Speed Way',
    estimatedDuration: 45,
    estimatedCost: 49,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const bookingSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  vehicleId: z.string().min(1),
  vin: z.string().min(1),
  serviceType: z.string().min(1),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  location: z.string().min(1),
  notes: z.string().optional()
});

// Seed initial booking data to MongoDB if empty
async function seedBookingsIfNeeded() {
  const db = await getDB();
  if (db && isMongoConnected()) {
    const collection = db.collection<Booking>('bookings');
    const count = await collection.countDocuments();
    
    if (count === 0) {
      await collection.insertMany(memoryBookings);
      console.log('📦 Seeded', memoryBookings.length, 'initial bookings to MongoDB');
    }
  }
}

// Seed data on module load
seedBookingsIfNeeded().catch(console.error);

// GET /api/booking - Get all bookings
bookingRouter.get('/booking', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const status = req.query.status as string | undefined;
    
    let allBookings: Booking[];
    let filtered: Booking[];
    
    if (db && isMongoConnected()) {
      // Use MongoDB
      const collection = db.collection<Booking>('bookings');
      const filter: any = {};
      if (status) filter.status = status;
      
      filtered = await collection.find(filter).sort({ createdAt: -1 }).toArray();
      allBookings = await collection.find().toArray();
    } else {
      // Use in-memory storage
      allBookings = memoryBookings;
      filtered = status ? memoryBookings.filter(b => b.status === status) : memoryBookings;
    }
    
    res.json({
      bookings: filtered,
      summary: {
        total: allBookings.length,
        scheduled: allBookings.filter(b => b.status === 'scheduled').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        inProgress: allBookings.filter(b => b.status === 'in-progress').length,
        completed: allBookings.filter(b => b.status === 'completed').length,
        upcomingThisWeek: allBookings.filter(b => {
          const bookingDate = new Date(b.scheduledDate);
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          return bookingDate <= weekFromNow && ['scheduled', 'confirmed'].includes(b.status);
        }).length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/booking - Create new booking
bookingRouter.post('/booking', async (req: Request, res: Response) => {
  try {
    const validated = bookingSchema.parse(req.body);
    const db = await getDB();
    
    console.log('📅 Booking creation received:', { customerName: validated.customerName, serviceType: validated.serviceType });
    
    let count = 0;
    if (db && isMongoConnected()) {
      const collection = db.collection<Booking>('bookings');
      count = await collection.countDocuments();
    } else {
      count = memoryBookings.length;
    }
    
    const newBooking: Booking = {
      id: `B${String(count + 1).padStart(3, '0')}`,
      ...validated,
      status: 'scheduled',
      estimatedDuration: 90,
      estimatedCost: 150,
      createdAt: new Date().toISOString()
    };
    
    if (db && isMongoConnected()) {
      // Save to MongoDB
      const collection = db.collection<Booking>('bookings');
      const result = await collection.insertOne(newBooking);
      console.log('✅ Booking saved to MongoDB:', result.insertedId);
    } else {
      // Save to in-memory storage
      memoryBookings.unshift(newBooking);
      console.log('✅ Booking saved to memory (total:', memoryBookings.length, ')');
    }
    
    res.status(201).json({
      success: true,
      booking: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid booking data', details: error.errors });
    }
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/booking/:id - Get specific booking
bookingRouter.get('/booking/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    let booking: Booking | null = null;
    
    if (db && isMongoConnected()) {
      const collection = db.collection<Booking>('bookings');
      booking = await collection.findOne({ id: req.params.id });
    } else {
      booking = memoryBookings.find(b => b.id === req.params.id) || null;
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});
