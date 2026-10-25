// One financial health scale for every page. Keep in step with getHealthStatus
// in ai-pfm-backend/src/services/health-score.utils.ts.

export interface HealthStatus {
    label: string;        // Excellent / Good / Needs Work / Critical
    risk: string;         // Low / Medium / High / Very High
    riskClass: string;    // CSS suffix for .status-text.status-*
    color: string;
    description: string;
}

export const getHealthStatus = (score: number): HealthStatus => {
    if (score >= 80) {
        return { label: 'Excellent', risk: 'Low', riskClass: 'low', color: '#10b981', description: 'Great financial habits. Keep it up.' };
    }
    if (score >= 60) {
        return { label: 'Good', risk: 'Medium', riskClass: 'medium', color: '#84cc16', description: 'A healthy profile with room to grow.' };
    }
    if (score >= 40) {
        return { label: 'Needs Work', risk: 'High', riskClass: 'high', color: '#f59e0b', description: 'A few areas need attention.' };
    }
    return { label: 'Critical', risk: 'Very High', riskClass: 'critical', color: '#ef4444', description: 'Immediate attention needed.' };
};

// What to tell the user when there isn't enough data for a score yet
export const noScoreMessage = (reason?: string | null) =>
    reason === 'no-income'
        ? 'Add your income for the last 30 days (or your monthly income in Profile) to get a score.'
        : 'Add your income and expenses for the last 30 days to get your financial health score.';
