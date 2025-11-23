export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const calculateBudgetPercentage = (amount: number, total: number): number => {
    if (total === 0) return 0;
    return (amount / total) * 100;
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};