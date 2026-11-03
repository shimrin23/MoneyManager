// One financial health scale for every page. Keep in step with getHealthStatus
// in ai-pfm-backend/src/services/health-score.utils.ts.
import { readLang } from '../i18n/adminText';
import { HEALTH_T } from '../i18n/healthText';

export interface HealthStatus {
    label: string;        // Excellent / Good / Needs Work / Critical
    risk: string;         // Low / Medium / High / Very High
    riskClass: string;    // CSS suffix for .status-text.status-*
    color: string;
    description: string;
}

export const getHealthStatus = (score: number): HealthStatus => {
    const t = HEALTH_T[readLang()];
    if (score >= 80) {
        return { label: t.excellent, risk: t.low, riskClass: 'low', color: '#10b981', description: t.descExcellent };
    }
    if (score >= 60) {
        return { label: t.good, risk: t.medium, riskClass: 'medium', color: '#10b981', description: t.descGood };
    }
    if (score >= 40) {
        return { label: t.needsWork, risk: t.high, riskClass: 'high', color: '#f59e0b', description: t.descNeedsWork };
    }
    return { label: t.critical, risk: t.veryHigh, riskClass: 'critical', color: '#ef4444', description: t.descCritical };
};

// What to tell the user when there isn't enough data for a score yet
export const noScoreMessage = (reason?: string | null) =>
    reason === 'no-income'
        ? HEALTH_T[readLang()].noScoreIncome
        : HEALTH_T[readLang()].noScoreDefault;
