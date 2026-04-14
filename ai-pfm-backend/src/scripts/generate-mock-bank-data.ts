import fs from 'fs';
import path from 'path';

const categories = ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Savings', 'Salary'];
const merchants = ['Acme Market', 'QuickFuel', 'Metro Gym', 'StreamFlix', 'Soundify', 'HomeRentals', 'UtilityCorp', 'Acme Payroll'];

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransaction(idx: number) {
    const isIncome = Math.random() < 0.2;
    const amount = isIncome ? Math.floor(Math.random() * 4000) + 2000 : Math.floor(Math.random() * 400) + 5;
    const category = isIncome ? 'Salary' : randomChoice(categories);
    return {
        id: `mock-${idx}-${Date.now()}`,
        amount,
        category,
        description: isIncome ? 'Payroll' : randomChoice(merchants),
        type: isIncome ? 'income' : 'expense',
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
        isRecurring: Math.random() < 0.3,
    };
}

function generateMockTransactions(count = 25) {
    return Array.from({ length: count }, (_, idx) => generateTransaction(idx));
}

const outPath = process.argv[2] || path.join(process.cwd(), 'mock-bank-transactions.json');
const count = Number(process.argv[3]) || 25;
const data = generateMockTransactions(count);
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Generated ${data.length} mock bank transactions at ${outPath}`);
