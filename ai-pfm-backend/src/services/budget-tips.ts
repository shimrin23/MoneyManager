// Tips for one budget category (the "Optimize" button on Smart Budgets).
// No database code here, so the rules can be unit tested.

export interface CategoryTipsInput {
    category: string;
    allocated: number | null;   // the budget limit, or null when there is no budget for it
    spent: number;              // spent in this category this month
    lastMonth: number;          // spent in this category last month
    topPlaces: { name: string; amount: number; count: number }[]; // this month, biggest first
    daysLeft: number;           // days left in the month, including today
}

export interface CategoryTips {
    category: string;
    allocated: number | null;
    spent: number;
    lastMonth: number;
    percentageUsed: number | null;
    topPlaces: { name: string; amount: number; count: number }[];
    insights: string[];         // what the numbers say
    tips: string[];             // what to do about it
}

// Practical tips per app category; anything else uses DEFAULT_TIPS
const CATEGORY_TIPS: Record<string, string[]> = {
    'food & dining': [
        'Plan the week\'s meals and buy groceries once a week with a list.',
        'Limit food delivery (PickMe Food, Uber Eats) to set days; the fees add up.',
        'Take lunch to work two or three days a week.',
    ],
    'shopping': [
        'Wait 24 hours before buying anything that isn\'t essential.',
        'Unsubscribe from sale emails and app notifications.',
        'Compare prices on Daraz and in-store before buying.',
    ],
    'transport': [
        'Combine errands into one trip.',
        'Compare PickMe and Uber fares, or use the bus or train for regular trips.',
        'Share rides with colleagues going the same way.',
    ],
    'entertainment': [
        'Review streaming subscriptions and keep only the ones you use.',
        'Look for free events and weekday offers.',
        'Set a fixed monthly amount for outings.',
    ],
    'bills & utilities': [
        'Switch off appliances at the wall and use fans before the air conditioner.',
        'Check if a cheaper mobile or data package covers your usage.',
        'Cancel services you no longer use.',
    ],
    'healthcare': [
        'Ask for generic medicines, which are usually cheaper.',
        'Check what your insurance or company scheme already covers.',
    ],
    'education': [
        'Look for free or lower-cost online courses before paying for one.',
        'Buy used textbooks or share them.',
    ],
    'travel': [
        'Book transport and stays early and travel off-peak.',
        'Set a trip budget before you leave.',
    ],
};

const DEFAULT_TIPS = [
    'Set a weekly limit for this category and check it every weekend.',
    'Look at your largest spends below and decide which ones you can skip.',
];

const lkr = (v: number) => `LKR ${Math.round(v).toLocaleString('en-US')}`;

export const buildCategoryTips = (input: CategoryTipsInput): CategoryTips => {
    const { category, allocated, spent, lastMonth, topPlaces, daysLeft } = input;
    const insights: string[] = [];
    const tips: string[] = [];

    const percentageUsed = allocated && allocated > 0 ? Math.round((spent / allocated) * 100) : null;

    if (allocated && allocated > 0) {
        if (spent > allocated) {
            insights.push(`You are ${lkr(spent - allocated)} over your ${category} budget of ${lkr(allocated)}.`);
            tips.push(`Pause non-essential ${category} spending for the rest of the month.`);
        } else {
            const left = allocated - spent;
            const perDay = daysLeft > 0 ? left / daysLeft : left;
            insights.push(`You have used ${percentageUsed}% of your ${lkr(allocated)} budget. ${lkr(left)} is left for ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`);
            tips.push(`Keep ${category} to about ${lkr(perDay)} a day to stay within budget.`);
        }
    } else {
        insights.push(`You have no budget for ${category}. Setting one makes it easier to keep spending in check.`);
    }

    if (lastMonth > 0) {
        const change = Math.round(((spent - lastMonth) / lastMonth) * 100);
        if (change > 0) insights.push(`You have already spent ${change}% more than all of last month (${lkr(lastMonth)}).`);
        else insights.push(`So far this is ${Math.abs(change)}% less than last month (${lkr(lastMonth)}).`);
    }

    if (topPlaces.length > 0) {
        const top = topPlaces[0];
        insights.push(`Most of it went to ${top.name}: ${lkr(top.amount)} over ${top.count} payment${top.count === 1 ? '' : 's'}.`);
        if (top.amount >= 1000) tips.push(`Cutting ${top.name} by a quarter would save about ${lkr(top.amount / 4)} this month.`);
    }

    if (spent > 0) {
        tips.push(`Spending 10% less on ${category} saves ${lkr(spent * 0.1)} a month, or ${lkr(spent * 1.2)} a year.`);
    } else {
        insights.push(`No ${category} spending recorded this month yet.`);
    }

    tips.push(...(CATEGORY_TIPS[category.trim().toLowerCase()] || DEFAULT_TIPS));

    return { category, allocated, spent, lastMonth, percentageUsed, topPlaces, insights, tips };
};
