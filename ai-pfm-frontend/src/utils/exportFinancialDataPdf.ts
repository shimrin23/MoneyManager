import { formatDate, formatDateTime, formatMoney } from './appFormat';
import { jsPDF } from 'jspdf';
import { apiClient } from '../api/client';

type Row = Record<string, any>;

interface ExportedData {
    exportedAt: string;
    profile: Row;
    settings: Record<string, Row>;
    transactions: Row[];
    budgets: Row[];
    goals: Row[];
}

const MARGIN = 15;
const LINE_HEIGHT = 6;

// "monthlyIncome" -> "Monthly income"
const toLabel = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const orDash = (value: unknown) => (value === undefined || value === null || value === '' ? '-' : String(value));

// Fetches the user's data and downloads it as a PDF
export const downloadFinancialDataPdf = async () => {
    const response = await apiClient.get<ExportedData>('/auth/export-data');
    const data = response.data;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = doc.internal.pageSize.getWidth() - MARGIN * 2;
    let y = MARGIN;

    const ensureSpace = (height: number) => {
        if (y + height > pageHeight - MARGIN) {
            doc.addPage();
            y = MARGIN;
        }
    };

    const writeLine = (text: string, size = 10, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        for (const line of doc.splitTextToSize(text, maxWidth)) {
            ensureSpace(LINE_HEIGHT);
            doc.text(line, MARGIN, y);
            y += LINE_HEIGHT;
        }
    };

    const writeHeading = (text: string) => {
        y += 4;
        ensureSpace(LINE_HEIGHT * 2);
        writeLine(text, 13, true);
        y += 1;
    };

    writeLine('MoneyManager - My Financial Data', 16, true);
    writeLine(`Exported: ${formatDateTime(data.exportedAt)}`, 9);

    writeHeading('Profile');
    Object.entries(data.profile).forEach(([key, value]) => writeLine(`${toLabel(key)}: ${orDash(value)}`));

    writeHeading('Settings');
    Object.entries(data.settings).forEach(([section, values]) => {
        writeLine(toLabel(section), 10, true);
        Object.entries(values).forEach(([key, value]) => writeLine(`   ${toLabel(key)}: ${orDash(value)}`));
    });

    writeHeading(`Transactions (${data.transactions.length})`);
    data.transactions.forEach(t => {
        writeLine(`${formatDate(t.date)}  ${orDash(t.type)}  ${orDash(t.category)}  ${formatMoney(t.amount)}  ${orDash(t.description)}`);
    });

    writeHeading(`Budgets (${data.budgets.length})`);
    data.budgets.forEach(b => {
        writeLine(`${orDash(b.category)}: limit ${formatMoney(b.allocatedAmount)}${b.alertThreshold ? `, alert at ${b.alertThreshold}%` : ''}`);
    });

    writeHeading(`Goals (${data.goals.length})`);
    data.goals.forEach(g => {
        writeLine(`${orDash(g.title)}: ${formatMoney(g.currentAmount)} of ${formatMoney(g.targetAmount)}, ${orDash(g.status)}, deadline ${formatDate(g.deadline)}`);
    });

    doc.save('my-financial-data.pdf');
};
