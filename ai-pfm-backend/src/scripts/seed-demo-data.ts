import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../schemas/user.schema';
import Transaction from '../schemas/transaction.schema';
import Budget from '../schemas/budget.schema';
import Goal from '../schemas/goal.schema';
import Subscription from '../schemas/subscription.schema';
import CreditCard from '../schemas/creditcard.schema';
import Loan from '../schemas/loan.schema';
import FixedDeposit from '../schemas/fixedDeposit.schema';
import Lease from '../schemas/lease.schema';
import Pawning from '../schemas/pawning.schema';
import Recommendation from '../schemas/recommendation.schema';
import Consent from '../schemas/consent.schema';

dotenv.config();

// Demo accounts for presentation screenshots. Safe to re-run: the demo
// customer's data is wiped and recreated each time.
const DEMO = { name: 'Nimal Perera', email: 'demo@moneymanager.lk', password: 'Demo@1234' };
const ADMIN = { name: 'Admin User', email: 'admin@epiclanka.lk', password: 'Admin@1234' };

// Deterministic random so every run produces the same screenshots
let rngState = 42;
const rand = () => ((rngState = (rngState * 16807) % 2147483647) - 1) / 2147483646;
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000);
const monthDate = (monthsBack: number, day: number) => {
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, day, 10, 0, 0);
  return d > now ? null : d;
};

async function upsertUser(u: { name: string; email: string; password: string }, role: 'customer' | 'admin', extra: object = {}) {
  const passwordHash = await bcrypt.hash(u.password, 10);
  return User.findOneAndUpdate(
    { email: u.email },
    {
      name: u.name, email: u.email, passwordHash, role,
      isVerified: true, pfmOptIn: true, customerSegment: 'premium',
      preferences: { language: 'en', notifications: true, emailReports: false },
      ...extra,
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
}

function buildTransactions(userId: string) {
  const txns: any[] = [];
  const add = (date: Date | null, type: 'income' | 'expense', category: string, merchant: string, amount: number, opts: object = {}) => {
    if (!date) return;
    txns.push({
      userId, type, category, amount, date,
      description: merchant, merchantName: merchant, normalizedMerchant: merchant,
      sourceAccount: 'SAV-001-4589', categoryConfidence: 0.95, processedAt: date, ingestionType: 'batch',
      isRecurring: false, ...opts,
    });
  };
  const monthly = (due: number) => ({ isRecurring: true, recurringFrequency: 'monthly', recurringDueDate: monthDate(-1, due) });

  for (let m = 5; m >= 0; m--) {
    const latest = m === 0;
    add(monthDate(m, 25), 'income', 'Salary', 'ABC Technologies Payroll', 245000, monthly(25));
    if (m % 2 === 0) add(monthDate(m, 5), 'income', 'Freelance', 'Upwork Payout', between(25000, 40000));

    add(monthDate(m, 5), 'expense', 'Bills & Utilities', 'CEB Electricity', between(5800, 7400), monthly(5));
    add(monthDate(m, 6), 'expense', 'Bills & Utilities', 'NWSDB Water', between(1500, 2100), monthly(6));
    add(monthDate(m, 8), 'expense', 'Bills & Utilities', 'Dialog Fibre', 3990, monthly(8));
    add(monthDate(m, 3), 'expense', 'Entertainment', 'Netflix', 2190, monthly(3));
    add(monthDate(m, 9), 'expense', 'Entertainment', 'Spotify Premium', 1190, monthly(9));
    add(monthDate(m, 15), 'expense', 'Education', 'Coursera Plus', 4500, monthly(15));
    add(monthDate(m, 1), 'expense', 'Bills & Utilities', 'Vehicle Loan EMI - Commercial Bank', 38500, monthly(1));

    for (const day of [2, 9, 16, 23]) {
      add(monthDate(m, day), 'expense', 'Food & Dining', rand() > 0.5 ? 'Keells Super' : 'Cargills Food City', between(3800, 7200));
    }
    // Dining grows in the latest month to trigger the "dining up 25%" insight
    const diningCount = latest ? 7 : 4;
    for (let k = 0; k < diningCount; k++) {
      const places = ['PickMe Food', 'Uber Eats', 'Ministry of Crab', 'Barista Colombo', 'KFC Sri Lanka'];
      add(monthDate(m, 3 + k * 4), 'expense', 'Food & Dining', places[k % places.length], between(1800, 4200));
    }
    for (let k = 0; k < 6; k++) {
      add(monthDate(m, 2 + k * 5), 'expense', 'Transport', k % 2 ? 'PickMe Ride' : 'Uber Lanka', between(650, 1600));
    }
    add(monthDate(m, 11), 'expense', 'Transport', 'Lanka IOC Fuel', between(9000, 12500));
    add(monthDate(m, 18), 'expense', 'Shopping', 'Daraz.lk', between(4500, 11000));
    if (m % 2 === 1) add(monthDate(m, 21), 'expense', 'Healthcare', 'Asiri Hospital Pharmacy', between(2500, 6500));
    if (m === 3) add(monthDate(m, 14), 'expense', 'Travel', 'Jetwing Hotels Ella', 42000);
  }

  // Duplicate-looking spike flagged by the anomaly detector
  add(daysAgo(4), 'expense', 'Shopping', 'Singer Mega', 18500, { isAnomaly: true, anomalyScore: 0.92 });
  add(daysAgo(4), 'expense', 'Shopping', 'Singer Mega', 18500, { isAnomaly: true, anomalyScore: 0.88 });
  return txns;
}

function loanSchedule(principal: number, ratePct: number, months: number, start: Date, paidMonths: number) {
  const r = ratePct / 100 / 12;
  const emi = Math.round((principal * r) / (1 - Math.pow(1 + r, -months)));
  let balance = principal;
  const schedule = [];
  for (let i = 1; i <= months; i++) {
    const interest = Math.round(balance * r);
    const princ = emi - interest;
    balance = Math.max(0, balance - princ);
    const due = new Date(start.getFullYear(), start.getMonth() + i, 1);
    schedule.push({ month: i, principalPayment: princ, interestPayment: interest, remainingBalance: balance, dueDate: due, paid: i <= paidMonths, paidDate: i <= paidMonths ? due : undefined });
  }
  return { emi, schedule, remaining: schedule[paidMonths - 1]?.remainingBalance ?? principal };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-pfm');
  console.log('Connected to MongoDB');

  const user = await upsertUser(DEMO, 'customer', {
    phone: '+94 77 123 4567', occupation: 'Software Engineer', address: 'Galle, Sri Lanka',
    dateOfBirth: '1998-04-12', monthlyIncome: 245000,
    bankAccounts: [
      { accountId: 'SAV-001-4589', instrumentType: 'savings', isActive: true },
      { accountId: 'CC-4111-2290', instrumentType: 'credit_card', isActive: true },
    ],
  });
  await upsertUser(ADMIN, 'admin');
  const userId = String(user!._id);
  const oid = user!._id;

  const models: any[] = [Transaction, Budget, Goal, Subscription, CreditCard, Loan, FixedDeposit, Recommendation, Consent];
  await Promise.all(models.map((M) => M.deleteMany({ userId })));
  await Promise.all([Lease.deleteMany({ userId: oid }), Pawning.deleteMany({ userId: oid })]);

  await Consent.insertMany(['pfm_analysis', 'data_sharing'].map((consentType) => ({
    userId, consentType, status: 'granted', version: '1.0', grantedAt: daysAgo(180),
    metadata: { source: 'web', consentText: 'I agree to PFM analysis of my financial data.' },
  })));

  const txns = buildTransactions(userId);
  await Transaction.insertMany(txns);

  await Budget.insertMany([
    ['Food & Dining', 45000], ['Transport', 22000], ['Shopping', 15000], ['Entertainment', 6000],
    ['Bills & Utilities', 52000], ['Healthcare', 8000], ['Education', 6000],
  ].map(([category, allocatedAmount]) => ({ userId, category, allocatedAmount })));

  await Goal.insertMany([
    { userId, title: 'Emergency Fund', targetAmount: 600000, currentAmount: 385000, deadline: daysAhead(150), category: 'Personal', priority: 'High', description: '6 months of expenses' },
    { userId, title: 'Japan Trip 2027', targetAmount: 450000, currentAmount: 120000, deadline: daysAhead(300), category: 'Travel', priority: 'Medium', description: 'Tokyo and Kyoto, 10 days' },
    { userId, title: 'New Laptop', targetAmount: 350000, currentAmount: 350000, deadline: daysAgo(10), status: 'Completed', category: 'Personal', priority: 'Low' },
    { userId, title: 'Master\'s Degree Fund', targetAmount: 1200000, currentAmount: 210000, deadline: daysAhead(700), category: 'Education', priority: 'High' },
  ]);

  await Subscription.insertMany([
    { userId, name: 'Netflix Premium', provider: 'Netflix', amount: 2190, frequency: 'monthly', nextPayment: daysAhead(5), category: 'Entertainment', lastUsed: daysAgo(1) },
    { userId, name: 'Spotify Premium', provider: 'Spotify', amount: 1190, frequency: 'monthly', nextPayment: daysAhead(9), category: 'Entertainment', lastUsed: daysAgo(74), isZombie: true },
    { userId, name: 'Dialog Fibre 100Mbps', provider: 'Dialog', amount: 3990, frequency: 'monthly', nextPayment: daysAhead(8), category: 'Bills & Utilities', lastUsed: daysAgo(0) },
    { userId, name: 'Coursera Plus', provider: 'Coursera', amount: 4500, frequency: 'monthly', nextPayment: daysAhead(15), category: 'Education', lastUsed: daysAgo(48), isZombie: true },
    { userId, name: 'Google One 2TB', provider: 'Google', amount: 9900, frequency: 'yearly', nextPayment: daysAhead(120), category: 'Other', lastUsed: daysAgo(3) },
  ]);

  await CreditCard.insertMany([
    { userId, cardName: 'Commercial Bank Visa Platinum', provider: 'Commercial Bank', creditLimit: 500000, currentBalance: 312000, availableLimit: 188000, minPaymentDue: 15600, dueDate: daysAhead(12), statementDate: daysAgo(13) },
    { userId, cardName: 'Sampath Mastercard Gold', provider: 'Sampath Bank', creditLimit: 250000, currentBalance: 48500, availableLimit: 201500, minPaymentDue: 2425, dueDate: daysAhead(20), statementDate: daysAgo(5) },
  ]);

  const vStart = new Date(now.getFullYear(), now.getMonth() - 14, 1);
  const v = loanSchedule(1800000, 14.5, 60, vStart, 14);
  const pStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const p = loanSchedule(500000, 18, 24, pStart, 6);
  await Loan.insertMany([
    { userId, type: 'Vehicle', provider: 'Commercial Bank', principal: 1800000, totalAmount: v.emi * 60, remainingAmount: v.remaining, interestRate: 14.5, tenure: 60, monthlyInstallment: v.emi, totalInterest: v.emi * 60 - 1800000, startDate: vStart, nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), endDate: new Date(vStart.getFullYear(), vStart.getMonth() + 60, 1), paymentSchedule: v.schedule },
    { userId, type: 'Personal', provider: 'Sampath Bank', principal: 500000, totalAmount: p.emi * 24, remainingAmount: p.remaining, interestRate: 18, tenure: 24, monthlyInstallment: p.emi, totalInterest: p.emi * 24 - 500000, startDate: pStart, nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), endDate: new Date(pStart.getFullYear(), pStart.getMonth() + 24, 1), paymentSchedule: p.schedule },
  ]);

  const fd = (principal: number, rate: number, months: number, startDaysAgo: number, type: string, bank: string, acct: string) => {
    const interest = Math.round(principal * (rate / 100) * (months / 12));
    const start = daysAgo(startDaysAgo);
    return { userId, bank, accountNumber: acct, principalAmount: principal, interestRate: rate, tenure: months, tenureUnit: 'months', startDate: start, maturityDate: new Date(start.getTime() + months * 30.4 * 86400000), maturityAmount: principal + interest, interestEarned: interest, type, status: 'active', autoRenewal: type === 'Standard' };
  };
  await FixedDeposit.insertMany([
    fd(300000, 9.5, 12, 120, 'Standard', 'Commercial Bank', 'FD-2025-00871'),
    fd(150000, 8.75, 6, 40, 'Goal-Linked', 'Sampath Bank', 'FD-2026-01244'),
  ]);

  await Lease.create({
    userId: oid, assetName: 'Toyota Aqua 2018', assetType: 'vehicle', lessor: 'LB Finance', principalAmount: 4200000,
    monthlyPayment: 98500, interestRate: 15.5, tenureMonths: 60, remainingMonths: 41, outstandingBalance: 3150000,
    startDate: daysAgo(19 * 30), endDate: daysAhead(41 * 30), nextPaymentDate: daysAhead(7), status: 'active', icon: '🚗',
  });
  await Pawning.create({
    userId: oid, itemDescription: '22K Gold Necklace (24g)', itemType: 'gold', icon: '💍', pledgedValue: 480000,
    loanAmount: 350000, interestRate: 16, monthlyInterest: 4667, pledgeDate: daysAgo(75), redemptionDate: daysAhead(105),
    branch: 'People\'s Bank - Galle', ticketNumber: 'PB-GL-2026-3381', status: 'active', daysRemaining: 105,
    totalInterestAccrued: 11667, totalDue: 361667,
  });

  await Recommendation.insertMany([
    { userId, category: 'budget', icon: '🍽️', priority: 'high', savingsAmount: 4000, title: 'Set a dining budget',
      reason: 'Dining spend increased 25% vs last month (7 orders vs 4).', action: 'Create a LKR 15,000 monthly cap for restaurants and delivery.',
      projectedImpact: 'Save about LKR 4,000 per month.', executionPath: 'Smart Budgets → Food & Dining cap with 80% alert' },
    { userId, category: 'subscription', icon: '🎧', priority: 'medium', savingsAmount: 5690, title: 'Cancel unused subscriptions',
      reason: 'Spotify (74 days) and Coursera (48 days) have not been used recently.', action: 'Cancel or pause both subscriptions.',
      projectedImpact: 'Save LKR 5,690 per month (LKR 68,280 per year).', executionPath: 'Subscriptions → Cancel' },
    { userId, category: 'debt', icon: '💳', priority: 'critical', savingsAmount: 21000, title: 'Convert card balance to an IPP',
      reason: 'Commercial Bank Visa utilisation is 62% at 28% APR.', action: 'Move LKR 300,000 into a 12-month Instalment Payment Plan.',
      projectedImpact: 'Cut interest by about LKR 21,000 this year and lower utilisation below 30%.', executionPath: 'Credit Cards → Request IPP conversion' },
    { userId, category: 'goal', icon: '🏦', priority: 'medium', savingsAmount: 2600, title: 'Open a goal-linked FD',
      reason: 'You have a monthly surplus of about LKR 75,000 sitting in savings at 3%.', action: 'Auto-transfer LKR 25,000 per month into a 6-month FD for the Japan Trip goal.',
      projectedImpact: 'Earn about LKR 2,600 more interest and reach the goal 3 months earlier.', executionPath: 'Goals → Japan Trip → Link FD' },
    { userId, category: 'alert', icon: '⚠️', priority: 'high', title: 'Possible duplicate charge',
      reason: 'Two identical LKR 18,500 charges from Singer Mega 4 days ago.', action: 'Review the transactions and raise a dispute if one is a duplicate.',
      projectedImpact: 'Recover LKR 18,500 if confirmed.', executionPath: 'Transactions → Anomalies → Dispute' },
    { userId, category: 'budget', icon: '🚕', priority: 'low', status: 'accepted', savingsAmount: 2500, title: 'Transport budget created',
      reason: 'Ride-hailing spend was above your 3-month average.', action: 'Created a LKR 22,000 transport cap.',
      projectedImpact: 'Saved LKR 2,500 last month.', executionPath: 'Smart Budgets → Transport' },
  ]);

  console.log(`\nSeeded ${txns.length} transactions plus budgets, goals, subscriptions, cards, loans, FDs, lease, pawning and recommendations.`);
  console.log('\nLogin credentials');
  console.log(`  Customer → ${DEMO.email} / ${DEMO.password}`);
  console.log(`  Admin    → ${ADMIN.email} / ${ADMIN.password}`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
