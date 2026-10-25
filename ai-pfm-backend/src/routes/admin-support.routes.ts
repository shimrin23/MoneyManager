import { Router, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import SupportTicket from '../schemas/support-ticket.schema';
import User from '../schemas/user.schema';

const router = Router();

const STAFF_ROLES = ['admin', 'ops', 'manager'];

// GET /api/admin/support/tickets - newest first, with the customer's name and email
router.get('/tickets', async (req: AuthRequest, res: Response) => {
    try {
        const staff = await User.findById(req.user?.id).select('role').lean();
        if (!staff || !STAFF_ROLES.includes((staff as any).role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const tickets = await SupportTicket.find().sort({ createdAt: -1 }).limit(200).lean();
        const customerIds = [...new Set(tickets.map(t => t.userId))];
        const customers = await User.find({ _id: { $in: customerIds } }).select('name email').lean();
        const customerById = new Map(customers.map(c => [String(c._id), c]));

        res.json(tickets.map(t => {
            const customer = customerById.get(t.userId);
            return {
                id: String(t._id),
                ticketNumber: t.ticketNumber,
                customerName: customer?.name || '',
                customerEmail: customer?.email || '',
                subject: t.subject,
                message: t.message,
                category: t.category,
                priority: t.priority,
                status: t.status,
                createdAt: t.createdAt,
            };
        }));
    } catch (err) {
        res.status(500).json({ error: 'Could not load support tickets' });
    }
});

export default router;
