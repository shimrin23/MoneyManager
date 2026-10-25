import express from 'express';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import User from '../schemas/user.schema';
import Notification from '../schemas/notification.schema';
import SupportTicket from '../schemas/support-ticket.schema';

const router = express.Router();

// Profile routes
router.get('/profile', (req: Request, res: Response) => {
  // Get user profile
  const userId = (req as any).user?.id;
  
  // Mock profile data - replace with actual database query
  const profile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 123 4567',
    dateOfBirth: '1990-01-01',
    address: '123 Main St, Colombo',
    bio: 'Personal finance enthusiast focused on building wealth through smart budgeting and investments.',
    avatar: null
  };
  
  res.json(profile);
});

router.put('/profile', (req: Request, res: Response) => {
  // Update user profile
  const userId = (req as any).user?.id;
  const profileData = req.body;
  
  // TODO: Validate and save to database
  console.log('Updating profile for user:', userId, profileData);
  
  res.json({ 
    message: 'Profile updated successfully',
    profile: profileData
  });
});

// Settings routes: each user's own values are saved on the user record
const APP_DEFAULTS = {
  currency: 'LKR',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  timezone: 'Asia/Colombo',
  theme: 'auto',
  defaultTransactionType: 'expense',
  categoryOrder: 'frequency',
  chartType: 'line',
  dashboardLayout: 'detailed'
};

const NOTIFICATION_DEFAULTS = {
  budgetAlerts: true,
  transactionAlerts: true,
  weeklyReports: true,
  monthlyReports: true,
  goalReminders: true,
  securityAlerts: true,
  marketingEmails: false,
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false
};

const PRIVACY_DEFAULTS = {
  dataCollection: true,
  analytics: true,
  marketingTracking: false,
  shareAnonData: true,
  profileVisibility: 'private',
  activityTracking: true
};

const readSettings = async (userId: string, section: string, defaults: Record<string, any>) => {
  const user = await User.findById(userId).select('settings').lean();
  const saved = ((user as any)?.settings?.[section]) || {};
  return { ...defaults, ...saved };
};

const saveSettings = async (userId: string, section: string, defaults: Record<string, any>, body: any) => {
  const current = await readSettings(userId, section, defaults);
  const next: Record<string, any> = { ...current };
  for (const key of Object.keys(defaults)) {
    if (body && body[key] !== undefined) next[key] = body[key];
  }
  // Security alerts are required and cannot be turned off
  if (section === 'notifications') next.securityAlerts = true;
  await User.updateOne({ _id: userId }, { $set: { [`settings.${section}`]: next } });
  return next;
};

router.get('/settings/app', async (req: Request, res: Response) => {
  try {
    res.json(await readSettings((req as any).user?.id, 'app', APP_DEFAULTS));
  } catch (err) {
    res.status(500).json({ error: 'Could not load app settings' });
  }
});

router.put('/settings/app', async (req: Request, res: Response) => {
  try {
    const settings = await saveSettings((req as any).user?.id, 'app', APP_DEFAULTS, req.body);
    res.json({ message: 'App settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ error: 'Could not save app settings' });
  }
});

router.get('/settings/notifications', async (req: Request, res: Response) => {
  try {
    res.json(await readSettings((req as any).user?.id, 'notifications', NOTIFICATION_DEFAULTS));
  } catch (err) {
    res.status(500).json({ error: 'Could not load notification settings' });
  }
});

router.put('/settings/notifications', async (req: Request, res: Response) => {
  try {
    const settings = await saveSettings((req as any).user?.id, 'notifications', NOTIFICATION_DEFAULTS, req.body);
    res.json({ message: 'Notification settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ error: 'Could not save notification settings' });
  }
});

router.get('/settings/privacy', async (req: Request, res: Response) => {
  try {
    res.json(await readSettings((req as any).user?.id, 'privacy', PRIVACY_DEFAULTS));
  } catch (err) {
    res.status(500).json({ error: 'Could not load privacy settings' });
  }
});

router.put('/settings/privacy', async (req: Request, res: Response) => {
  try {
    const settings = await saveSettings((req as any).user?.id, 'privacy', PRIVACY_DEFAULTS, req.body);
    res.json({ message: 'Privacy settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ error: 'Could not save privacy settings' });
  }
});

// Account management routes
router.post('/security/enable-2fa', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  // Generate QR code and backup codes
  const response = {
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    backupCodes: [
      'ABC123DEF456',
      'GHI789JKL012',
      'MNO345PQR678',
      'STU901VWX234',
      'YZA567BCD890'
    ]
  };
  
  res.json(response);
});

router.post('/security/disable-2fa', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  console.log('Disabling 2FA for user:', userId);
  
  res.json({ message: '2FA disabled successfully' });
});

router.post('/security/download-data', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  // TODO: Generate actual data export
  const userData = {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    transactions: [],
    settings: {},
    exportDate: new Date().toISOString()
  };
  
  res.json({
    message: 'Data export ready',
    data: userData,
    downloadUrl: '/api/export/download/' + userId
  });
});

// Notifications routes: each user's notifications are stored in the notifications collection
const toNotificationDto = (n: any) => ({
  id: n._id.toString(),
  type: n.type,
  title: n.title,
  message: n.message,
  link: n.link,
  actionRequired: n.actionRequired,
  read: n.read,
  timestamp: n.createdAt,
});

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: (req as any).user?.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(notifications.map(toNotificationDto));
  } catch (err) {
    res.status(500).json({ error: 'Could not load notifications' });
  }
});

router.put('/notifications/mark-all-read', async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({ userId: (req as any).user?.id, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update notifications' });
  }
});

router.put('/notifications/:id/read', async (req: Request, res: Response) => {
  const notificationId = req.params.id;
  if (!mongoose.isValidObjectId(notificationId)) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  try {
    const result = await Notification.updateOne(
      { _id: notificationId, userId: (req as any).user?.id },
      { $set: { read: true } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update notification' });
  }
});

router.delete('/notifications/:id', async (req: Request, res: Response) => {
  const notificationId = req.params.id;
  if (!mongoose.isValidObjectId(notificationId)) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  try {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId: (req as any).user?.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete notification' });
  }
});

// Support routes: tickets are saved and given a ticket number
const SUPPORT_CATEGORIES = ['general', 'technical', 'billing', 'feature', 'security'];
const SUPPORT_PRIORITIES = ['low', 'medium', 'high'];

router.post('/support/tickets', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const category = SUPPORT_CATEGORIES.includes(req.body?.category) ? req.body.category : 'general';
  const priority = SUPPORT_PRIORITIES.includes(req.body?.priority) ? req.body.priority : 'medium';

  if (!subject) {
    return res.status(400).json({ error: 'Please enter a subject' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Please enter a message' });
  }
  if (subject.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: 'Subject or message is too long' });
  }

  try {
    const ticket = await SupportTicket.create({
      ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`,
      userId,
      subject,
      message,
      category,
      priority,
    });
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not create support ticket' });
  }
});

export { router as userRoutes };