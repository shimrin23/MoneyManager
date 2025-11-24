import express from 'express';
import { Request, Response } from 'express';

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

// Settings routes
router.get('/settings/app', (req: Request, res: Response) => {
  // Get app settings
  const userId = (req as any).user?.id;
  
  // Mock settings data
  const settings = {
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
  
  res.json(settings);
});

router.put('/settings/app', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const settingsData = req.body;
  
  console.log('Updating app settings for user:', userId, settingsData);
  
  res.json({
    message: 'App settings updated successfully',
    settings: settingsData
  });
});

router.get('/settings/notifications', (req: Request, res: Response) => {
  const settings = {
    budgetAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    goalReminders: true,
    securityAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  };
  
  res.json(settings);
});

router.put('/settings/notifications', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const settingsData = req.body;
  
  console.log('Updating notification settings for user:', userId, settingsData);
  
  res.json({
    message: 'Notification settings updated successfully',
    settings: settingsData
  });
});

router.get('/settings/privacy', (req: Request, res: Response) => {
  const settings = {
    dataCollection: true,
    analytics: true,
    marketingTracking: false,
    shareAnonData: true,
    profileVisibility: 'private',
    activityTracking: true
  };
  
  res.json(settings);
});

router.put('/settings/privacy', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const settingsData = req.body;
  
  console.log('Updating privacy settings for user:', userId, settingsData);
  
  res.json({
    message: 'Privacy settings updated successfully',
    settings: settingsData
  });
});

// Account management routes
router.post('/security/change-password', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { currentPassword, newPassword } = req.body;
  
  // TODO: Validate current password and update
  console.log('Password change request for user:', userId);
  
  // Simulate success
  res.json({ message: 'Password changed successfully' });
});

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

router.delete('/account', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { confirmation } = req.body;
  
  if (confirmation !== 'DELETE') {
    return res.status(400).json({ error: 'Invalid confirmation' });
  }
  
  // TODO: Delete user account and all data
  console.log('Account deletion requested for user:', userId);
  
  res.json({ message: 'Account deletion initiated' });
});

// Notifications routes
router.get('/notifications', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Monthly Budget Report Ready',
      message: 'Your December financial report is now available for review.',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Budget Alert: Dining Out',
      message: 'You\'ve spent 85% of your dining out budget for this month.',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Savings Goal Achieved!',
      message: 'Congratulations! You\'ve reached your emergency fund goal of Rs. 100,000.',
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      read: true
    },
    {
      id: 4,
      type: 'alert',
      title: 'Unusual Spending Detected',
      message: 'We noticed higher than normal spending in the Shopping category.',
      time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      read: true
    }
  ];
  
  res.json(notifications);
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notificationId = req.params.id;
  
  console.log('Marking notification as read:', notificationId);
  
  res.json({ message: 'Notification marked as read' });
});

router.delete('/notifications/:id', (req: Request, res: Response) => {
  const notificationId = req.params.id;
  
  console.log('Deleting notification:', notificationId);
  
  res.json({ message: 'Notification deleted' });
});

// Support routes
router.post('/support/tickets', (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const ticketData = req.body;
  
  // TODO: Create support ticket in database
  console.log('Creating support ticket for user:', userId, ticketData);
  
  const ticket = {
    id: Date.now(),
    ...ticketData,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Support ticket created successfully',
    ticket
  });
});

export { router as userRoutes };