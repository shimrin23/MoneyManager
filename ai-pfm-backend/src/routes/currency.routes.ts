import { Router, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// Amounts are stored in LKR. These rates turn LKR into the currency a user has chosen.
const RATES_URL = 'https://open.er-api.com/v6/latest/LKR';
const CACHE_MS = 12 * 60 * 60 * 1000;

// Approximate rates, used only if the live service cannot be reached
const FALLBACK_RATES: Record<string, number> = {
    LKR: 1, USD: 0.003, EUR: 0.0028, GBP: 0.0024, INR: 0.25, JPY: 0.45, CAD: 0.0041, AUD: 0.0046
};

let cache: { rates: Record<string, number>; updatedAt: string; fetchedAt: number } | null = null;

const loadRates = async () => {
    if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
        return { ...cache, source: 'cached' as const };
    }
    try {
        const response = await axios.get(RATES_URL, { timeout: 5000 });
        if (response.data?.result !== 'success' || !response.data?.rates) {
            throw new Error('Unexpected response from rate service');
        }
        cache = {
            rates: response.data.rates,
            updatedAt: response.data.time_last_update_utc,
            fetchedAt: Date.now()
        };
        return { ...cache, source: 'live' as const };
    } catch (err: any) {
        console.error('[Currency] Could not load live rates:', err?.message || err);
        if (cache) return { ...cache, source: 'cached' as const };
        return { rates: FALLBACK_RATES, updatedAt: null, fetchedAt: 0, source: 'fallback' as const };
    }
};

// GET /api/currency/rates - rates from LKR to each currency, with where they came from
router.get('/rates', async (req: AuthRequest, res: Response) => {
    const data = await loadRates();
    res.json({ base: 'LKR', rates: data.rates, updatedAt: data.updatedAt, source: data.source });
});

export default router;
