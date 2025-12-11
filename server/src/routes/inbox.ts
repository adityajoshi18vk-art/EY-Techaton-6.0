import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB, isMongoConnected } from '../db/mongodb';
import { ObjectId } from 'mongodb';

export const inboxRouter = Router();

interface Notification {
  _id?: ObjectId;
  id: string;
  customerId: string;
  customerEmail: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'info';
  category: 'vehicle' | 'booking' | 'maintenance' | 'general';
  read: boolean;
  createdAt: string;
  createdBy?: string; // 'system' or employee email
}

// In-memory fallback storage
const memoryNotifications: Notification[] = [];

const notificationSchema = z.object({
  customerId: z.string().min(1),
  customerEmail: z.string().email(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['alert', 'reminder', 'info']),
  category: z.enum(['vehicle', 'booking', 'maintenance', 'general']),
  createdBy: z.string().optional(),
});

// Auto-generate notifications based on bookings and diagnostics
export async function generateAutoNotifications() {
  const db = await getDB();
  
  if (db && isMongoConnected()) {
    const bookingsCollection = db.collection('bookings');
    const notificationsCollection = db.collection<Notification>('notifications');
    
    // Get upcoming bookings (next 24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingBookings = await bookingsCollection.find({
      scheduledDate: tomorrow.toISOString().split('T')[0],
      status: { $in: ['scheduled', 'confirmed'] }
    }).toArray();
    
    // Create reminders for upcoming bookings
    for (const booking of upcomingBookings) {
      const existingNotification = await notificationsCollection.findOne({
        customerId: booking.customerId,
        category: 'booking',
        message: { $regex: booking.id }
      });
      
      if (!existingNotification) {
        const notification: Notification = {
          id: `N${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          customerId: booking.customerId,
          customerEmail: booking.customerName.toLowerCase().replace(' ', '.') + '@example.com',
          title: 'Service Appointment Reminder',
          message: `Your ${booking.serviceType} appointment (${booking.id}) is scheduled for tomorrow at ${booking.scheduledTime}.`,
          type: 'reminder',
          category: 'booking',
          read: false,
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        };
        
        await notificationsCollection.insertOne(notification);
        console.log('📬 Auto-generated booking reminder for', booking.customerName);
      }
    }
  }
}

// Seed initial notifications for demo
async function seedNotificationsIfNeeded() {
  const db = await getDB();
  if (db && isMongoConnected()) {
    const collection = db.collection<Notification>('notifications');
    const count = await collection.countDocuments();
    
    if (count === 0) {
      const demoNotifications: Notification[] = [
        {
          id: 'N001',
          customerId: 'C001',
          customerEmail: 'customer@example.com',
          title: 'Welcome to Our Service!',
          message: 'Thank you for choosing our automotive service. We\'re here to keep your vehicle running smoothly.',
          type: 'info',
          category: 'general',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdBy: 'system'
        },
        {
          id: 'N002',
          customerId: 'C001',
          customerEmail: 'customer@example.com',
          title: 'Oil Change Due',
          message: 'Your vehicle is due for an oil change. Book an appointment to maintain optimal engine performance.',
          type: 'reminder',
          category: 'maintenance',
          read: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          createdBy: 'system'
        }
      ];
      
      await collection.insertMany(demoNotifications);
      console.log('📦 Seeded', demoNotifications.length, 'initial notifications to MongoDB');
    }
  }
}

// Seed on module load
seedNotificationsIfNeeded().catch(console.error);

// GET /api/inbox - Get notifications for a customer
inboxRouter.get('/inbox', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const { customerId, customerEmail, unreadOnly } = req.query;
    
    console.log('📬 Fetching notifications with filters:', { customerId, customerEmail, unreadOnly });
    
    let notifications: Notification[];
    
    if (db && isMongoConnected()) {
      const collection = db.collection<Notification>('notifications');
      const filter: any = {};
      
      if (customerId) filter.customerId = customerId;
      if (customerEmail) filter.customerEmail = customerEmail;
      if (unreadOnly === 'true') filter.read = false;
      
      notifications = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    } else {
      notifications = memoryNotifications.filter(n => {
        if (customerId && n.customerId !== customerId) return false;
        if (customerEmail && n.customerEmail !== customerEmail) return false;
        if (unreadOnly === 'true' && n.read) return false;
        return true;
      });
    }
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({
      notifications,
      summary: {
        total: notifications.length,
        unread: unreadCount,
        byType: {
          alert: notifications.filter(n => n.type === 'alert').length,
          reminder: notifications.filter(n => n.type === 'reminder').length,
          info: notifications.filter(n => n.type === 'info').length,
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/inbox - Create new notification (for employees)
inboxRouter.post('/inbox', async (req: Request, res: Response) => {
  try {
    const validated = notificationSchema.parse(req.body);
    const db = await getDB();
    
    console.log('📨 Creating notification:', {
      title: validated.title,
      customerId: validated.customerId,
      customerEmail: validated.customerEmail,
      type: validated.type,
      category: validated.category
    });
    
    let count = 0;
    if (db && isMongoConnected()) {
      const collection = db.collection<Notification>('notifications');
      count = await collection.countDocuments();
    } else {
      count = memoryNotifications.length;
    }
    
    const newNotification: Notification = {
      id: `N${String(count + 1).padStart(3, '0')}`,
      ...validated,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    if (db && isMongoConnected()) {
      const collection = db.collection<Notification>('notifications');
      const result = await collection.insertOne(newNotification);
      console.log('✅ Notification saved to MongoDB:', result.insertedId);
    } else {
      memoryNotifications.unshift(newNotification);
      console.log('✅ Notification saved to memory (total:', memoryNotifications.length, ')');
    }
    
    res.status(201).json({
      success: true,
      notification: newNotification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid notification data', details: error.errors });
    }
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PATCH /api/inbox/:id/read - Mark notification as read
inboxRouter.patch('/inbox/:id/read', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    
    if (db && isMongoConnected()) {
      const collection = db.collection<Notification>('notifications');
      const result = await collection.updateOne(
        { id },
        { $set: { read: true } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } else {
      const notification = memoryNotifications.find(n => n.id === id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      notification.read = true;
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /api/inbox/:id - Delete notification
inboxRouter.delete('/inbox/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    
    if (db && isMongoConnected()) {
      const collection = db.collection<Notification>('notifications');
      const result = await collection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } else {
      const index = memoryNotifications.findIndex(n => n.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      memoryNotifications.splice(index, 1);
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});
