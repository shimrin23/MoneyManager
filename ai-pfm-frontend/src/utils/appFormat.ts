// Display preferences saved by the Settings page, and the date formatting used across the app.

export type DashboardLayout = 'compact' | 'detailed' | 'minimal';
export type ChartType = 'line' | 'bar' | 'pie';

export interface AppPrefs {
    currency: string;
    dateFormat: string;
    timezone: string;
    dashboardLayout: DashboardLayout;
    chartType: ChartType;
}

const PREFS_KEY = 'pfm_app_prefs';

const DEFAULT_PREFS: AppPrefs = {
    currency: 'LKR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Colombo',
    dashboardLayout: 'detailed',
    chartType: 'line'
};

export const getAppPrefs = (): AppPrefs => {
    try {
        return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
    } catch {
        return DEFAULT_PREFS;
    }
};

export const saveAppPrefs = (prefs: Partial<AppPrefs>) => {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ ...getAppPrefs(), ...prefs }));
    } catch {
        // Storage can be unavailable (for example in private mode); the defaults are used then
    }
};

// Money: amounts are stored in LKR and converted for display with the rates from the backend
export const CURRENCY_SYMBOLS: Record<string, string> = {
    LKR: 'Rs', USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$'
};

// Used until the live rates arrive, and if they never do
let rates: Record<string, number> = {
    LKR: 1, USD: 0.003, EUR: 0.0028, GBP: 0.0024, INR: 0.25, JPY: 0.45, CAD: 0.0041, AUD: 0.0046
};

export const setRates = (newRates: Record<string, number>) => {
    rates = { ...rates, ...newRates };
};

// Formats an amount that is stored in LKR, in the currency chosen in Settings
export const formatMoney = (amountInLkr: number | null | undefined, decimals?: number): string => {
    if (amountInLkr === null || amountInLkr === undefined || isNaN(Number(amountInLkr))) return '-';
    const { currency } = getAppPrefs();
    const rate = rates[currency] ?? 1;
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    const value = Number(amountInLkr) * rate;
    // Rupees are shown in whole numbers; other currencies keep cents (yen has none)
    const digits = currency === 'JPY' ? 0 : decimals ?? (currency === 'LKR' ? 0 : 2);
    const number = value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return currency === 'LKR' ? `Rs ${number}` : `${symbol}${number}`;
};

// Forms: the user types in the chosen currency, and amounts are stored in LKR
export const currencyCode = (): string => getAppPrefs().currency;

export const getRate = (): number => rates[getAppPrefs().currency] ?? 1;

// Typed amount (chosen currency) -> LKR, rounded to cents, for saving
export const toLkr = (amount: number): number => Math.round((amount / getRate()) * 100) / 100;

// Stored LKR amount -> chosen currency, for editing
export const fromLkr = (amountInLkr: number): number => Math.round(amountInLkr * getRate() * 100) / 100;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

interface DateParts {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
}

const partsInTimezone = (date: Date, timeZone: string): DateParts => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
};

type DateInput = string | number | Date;

const toDate = (value: DateInput | null | undefined): Date | null => {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
};

// Shows the date part only, in the chosen format and timezone
export const formatDate = (value: DateInput | null | undefined): string => {
    const date = toDate(value);
    if (!date) return '-';
    const { dateFormat, timezone } = getAppPrefs();
    // A plain calendar date (2026-10-25) is shown as written, so timezones don't move it to another day
    const parts = typeof value === 'string' && DATE_ONLY.test(value)
        ? (() => { const [year, month, day] = value.split('-'); return { year, month, day, hour: '', minute: '' }; })()
        : partsInTimezone(date, timezone);
    const { year, month, day } = parts;
    switch (dateFormat) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
        default: return `${day}/${month}/${year}`;
    }
};

// Date and time, for values that have a time of day
export const formatDateTime = (value: DateInput | null | undefined): string => {
    const date = toDate(value);
    if (!date) return '-';
    const { timezone } = getAppPrefs();
    if (typeof value === 'string' && DATE_ONLY.test(value)) return formatDate(value);
    const { hour, minute } = partsInTimezone(date, timezone);
    return `${formatDate(value)} ${hour}:${minute}`;
};
