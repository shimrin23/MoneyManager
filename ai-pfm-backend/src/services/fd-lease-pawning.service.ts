// Calculations and input checks shared by the fixed deposit, lease and pawning routes.
// Kept free of database code so they can be unit tested.

const DAY_MS = 1000 * 60 * 60 * 24;

export const FD_TYPES = ['Standard', 'Goal-Linked', 'Tax Saver'];
export const FD_TENURE_UNITS = ['months', 'years'];
export const LEASE_ASSET_TYPES = ['vehicle', 'equipment', 'property', 'other'];
export const LEASE_STATUSES = ['active', 'completed', 'defaulted'];
export const PAWN_ITEM_TYPES = ['gold', 'jewelry', 'electronics', 'documents', 'other'];
export const PAWN_STATUSES = ['active', 'redeemed', 'auctioned', 'renewed'];

// Number from a form value; NaN for empty or non-numeric input
export const toNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
};

const isBlank = (value: unknown) => typeof value !== 'string' || value.trim() === '';

const toDate = (value: unknown): Date | null => {
    if (value === null || value === undefined || value === '') return null;
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? null : d;
};

// Adds calendar months without overflowing: 31 Jan + 1 month = 28/29 Feb, not 2/3 Mar
export const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay));
    return result;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------- Fixed deposits ----------

export const fdTenureMonths = (tenure: number, unit: string) => (unit === 'years' ? tenure * 12 : tenure);

// Simple interest, matching how the FD was calculated before
export const calculateFD = (principal: number, rate: number, tenureMonths: number, startDate: Date) => {
    const interestEarned = round2((principal * rate * tenureMonths) / (100 * 12));
    return {
        interestEarned,
        maturityAmount: round2(principal + interestEarned),
        maturityDate: addMonths(startDate, tenureMonths),
    };
};

export const validateFDInput = (body: Record<string, unknown>): string | null => {
    const principal = toNumber(body.principalAmount);
    const rate = toNumber(body.interestRate);
    const tenure = toNumber(body.tenure);
    const unit = (body.tenureUnit as string) || 'months';

    if (isNaN(principal) || isNaN(rate) || isNaN(tenure)) {
        return 'Principal amount, interest rate and tenure are required';
    }
    if (principal <= 0) return 'Principal amount must be greater than 0';
    if (rate <= 0) return 'Interest rate must be greater than 0%';
    if (rate > 100) return 'Interest rate cannot be more than 100%';
    if (!FD_TENURE_UNITS.includes(unit)) return 'Tenure unit must be months or years';
    if (!Number.isInteger(tenure) || tenure <= 0) return 'Tenure must be a whole number greater than 0';
    if (fdTenureMonths(tenure, unit) > 120) return 'Tenure cannot be more than 10 years';
    if (body.type !== undefined && !FD_TYPES.includes(body.type as string)) return 'Invalid FD type';

    // Start date is optional (defaults to today), so an FD opened earlier can be recorded
    if (body.startDate !== undefined && body.startDate !== '') {
        const start = toDate(body.startDate);
        if (!start) return 'Start date is not a valid date';
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        if (start.getTime() > endOfToday.getTime()) return 'Start date cannot be in the future';
        if (start.getTime() < addMonths(new Date(), -120).getTime()) return 'Start date cannot be more than 10 years ago';
    }
    return null;
};

interface FDState {
    principalAmount: number;
    interestRate: number;
    tenure: number;
    tenureUnit: string;
    startDate: Date;
    maturityDate: Date;
    maturityAmount: number;
    interestEarned: number;
    status: string;
    autoRenewal: boolean;
}

// A new term that starts on `startDate` and reinvests the previous maturity amount
export const renewFD = (fd: FDState, startDate: Date) => {
    const principalAmount = fd.maturityAmount;
    const terms = calculateFD(principalAmount, fd.interestRate, fdTenureMonths(fd.tenure, fd.tenureUnit), startDate);
    return { principalAmount, startDate, ...terms, status: 'active' };
};

// Brings an active FD up to date: matured when its date has passed,
// or rolled over into new terms when auto-renewal is on. Returns null when nothing changes.
export const applyMaturity = (fd: FDState, now: Date) => {
    if (fd.status !== 'active' || new Date(fd.maturityDate).getTime() > now.getTime()) return null;
    if (!fd.autoRenewal) return { status: 'matured' };

    let current: FDState = { ...fd };
    // Renew term by term until the current term ends in the future (capped for safety)
    for (let i = 0; i < 200 && new Date(current.maturityDate).getTime() <= now.getTime(); i++) {
        current = { ...current, ...renewFD(current, new Date(current.maturityDate)) };
    }
    return {
        principalAmount: current.principalAmount,
        startDate: current.startDate,
        maturityDate: current.maturityDate,
        maturityAmount: current.maturityAmount,
        interestEarned: current.interestEarned,
        status: 'active',
    };
};

// ---------- Leases ----------

export const validateLeaseInput = (body: Record<string, unknown>): string | null => {
    const principal = toNumber(body.principalAmount);
    const monthly = toNumber(body.monthlyPayment);
    const rate = toNumber(body.interestRate);
    const tenure = toNumber(body.tenureMonths);

    if (isBlank(body.assetName)) return 'Asset name is required';
    if (isBlank(body.lessor)) return 'Lessor / finance company is required';
    if (!LEASE_ASSET_TYPES.includes(body.assetType as string)) return 'Invalid asset type';
    if (isNaN(principal) || principal <= 0) return 'Principal amount must be greater than 0';
    if (isNaN(monthly) || monthly <= 0) return 'Monthly payment must be greater than 0';
    if (isNaN(rate) || rate < 0) return 'Interest rate cannot be negative';
    if (rate > 100) return 'Interest rate cannot be more than 100%';
    if (isNaN(tenure) || !Number.isInteger(tenure) || tenure <= 0) return 'Tenure must be a whole number of months greater than 0';
    if (tenure > 600) return 'Tenure cannot be more than 600 months';
    if (!toDate(body.startDate)) return 'A valid start date is required';
    return null;
};

// Installment k (1-based) is due k months after the start date.
// Counts the installments already due on `now`, which are treated as paid when the lease is added.
export const installmentsDue = (startDate: Date, tenureMonths: number, now: Date) => {
    let due = 0;
    while (due < tenureMonths && addMonths(startDate, due + 1).getTime() <= now.getTime()) due++;
    return due;
};

// Remaining months, outstanding balance and next due date after `paidMonths` installments
export const leaseProgress = (principal: number, tenureMonths: number, startDate: Date, paidMonths: number) => {
    const paid = Math.min(Math.max(0, paidMonths), tenureMonths);
    const remainingMonths = tenureMonths - paid;
    return {
        paidMonths: paid,
        remainingMonths,
        outstandingBalance: round2(principal * (remainingMonths / tenureMonths)),
        nextPaymentDate: remainingMonths > 0 ? addMonths(startDate, paid + 1) : null,
    };
};

// ---------- Pawning ----------

export const validatePawnInput = (body: Record<string, unknown>): string | null => {
    const pledged = toNumber(body.pledgedValue);
    const loan = toNumber(body.loanAmount);
    const rate = toNumber(body.interestRate);
    const pledgeDate = toDate(body.pledgeDate);
    const redemptionDate = toDate(body.redemptionDate);

    if (isBlank(body.itemDescription)) return 'Item description is required';
    if (!PAWN_ITEM_TYPES.includes(body.itemType as string)) return 'Invalid item type';
    if (isNaN(pledged) || pledged <= 0) return 'Pledged value must be greater than 0';
    if (isNaN(loan) || loan <= 0) return 'Loan amount must be greater than 0';
    if (loan > pledged) return 'Loan amount cannot be more than the pledged value';
    if (isNaN(rate) || rate < 0) return 'Interest rate cannot be negative';
    if (rate > 100) return 'Interest rate cannot be more than 100%';
    if (isBlank(body.branch)) return 'Branch is required';
    if (isBlank(body.ticketNumber)) return 'Ticket number is required';
    if (!pledgeDate) return 'A valid pledge date is required';
    if (!redemptionDate) return 'A valid redemption date is required';
    if (redemptionDate.getTime() <= pledgeDate.getTime()) return 'Redemption date must be after the pledge date';
    return null;
};

// Days left until the redemption date; negative when the item is overdue
export const pawnDaysRemaining = (redemptionDate: Date, now: Date) =>
    Math.ceil((new Date(redemptionDate).getTime() - now.getTime()) / DAY_MS);

export const pawnInterest = (loanAmount: number, interestRate: number, pledgeDate: Date, now: Date) => {
    const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
    const start = new Date(pledgeDate);
    const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
    const totalInterestAccrued = monthlyInterest * monthsElapsed;
    return { monthlyInterest, totalInterestAccrued, totalDue: loanAmount + totalInterestAccrued };
};
