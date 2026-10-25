import { createHash } from "crypto";

export interface ParsedBankTransaction {
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  balance?: number;
  category: string;
  reference?: string;
  sourceAccount: string;
}

export type SupportedSriLankanBank =
  | "combank"
  | "hnb"
  | "sampath"
  | "boc"
  | "peoples"
  | "frimi"
  | "generic";

/**
 * Intelligent categorization based on typical Sri Lankan merchant descriptions & keywords.
 * Returns the same category names the app uses when adding a transaction by hand,
 * so imported rows land in the existing budgets (e.g. "Transport", not "Transportation").
 */
export function inferCategory(description: string, type: "income" | "expense" = "expense"): string {
  const desc = description.toUpperCase();

  if (type === "income") {
    if (/SALARY|PAYROLL/.test(desc)) return "Salary";
    if (/DIVIDEND|INTEREST|FD MATURITY/.test(desc)) return "Investment";
    if (/FREELANCE|UPWORK|FIVERR/.test(desc)) return "Freelance";
    return "Other";
  }

  if (/KEELLS|CARGILLS|ARPICO|SPAR|GLOMARK|SUPERMARKET|GROCERY/.test(desc)) {
    return "Food & Dining";
  }
  if (/CEB|LECO|WATER BOARD|NWSDB|SLT|DIALOG|MOBITEL|AIRTEL|HUTCH|ELECTRICITY|TELECOM|UTILITY/.test(desc)) {
    return "Bills & Utilities";
  }
  if (/UBER|PICKME|TAXI|FUEL|IOC|PETROL|SHED|RAILWAY|HIGHWAY|TOLL/.test(desc)) {
    return "Transport";
  }
  if (/KFC|MCDONALD|PIZZA|BURGER|CAFE|RESTAURANT|BAKERY|FOOD|BAR/.test(desc)) {
    return "Food & Dining";
  }
  if (/DARAZ|AMAZON|ALIEXPRESS|CLOTHING|ODEL|FASHION|FASHION BUG|COTTON COLLECTION/.test(desc)) {
    return "Shopping";
  }
  if (/HOSPITAL|PHARMACY|ASIRI|NAWALOKA|DURDANS|MEDICINE|HEALTH|CLINIC/.test(desc)) {
    return "Healthcare";
  }
  if (/NETFLIX|SPOTIFY|PRIME|CINEMA|MOVIE|ENTERTAINMENT/.test(desc)) {
    return "Entertainment";
  }
  if (/INSURANCE|CEYLINCO|AIA|SLIC|UNION ASSURANCE/.test(desc)) {
    return "Bills & Utilities";
  }
  if (/SCHOOL|TUITION|UNIVERSITY|COURSE|EXAM FEE/.test(desc)) {
    return "Education";
  }
  return "Other";
}

/**
 * Cleans monetary string into valid number:
 * e.g., "1,250.00" -> 1250.00
 * "(500.00)" -> -500.00
 * "LKR 4,500.50" -> 4500.50
 */
function parseMoney(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/LKR|Rs\.?|\s|,/gi, "").trim();
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    return -Math.abs(parseFloat(cleaned.slice(1, -1)) || 0);
  }
  return parseFloat(cleaned) || 0;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

// Builds a UTC date only when the day and month really exist (no 32/13 rolling into the next year)
function buildDate(year: number, month: number, day: number): Date | null {
  if (year < 100) year += 2000;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day ? d : null;
}

/**
 * Date parser supporting DD/MM/YYYY, DD-MM-YYYY, DD-MMM-YYYY (e.g. 05-Oct-2024) and YYYY-MM-DD.
 * Returns null for anything that isn't a real date, so the row can be skipped and reported.
 */
export function parseDateFlexible(val: string | undefined): Date | null {
  if (!val) return null;
  const cleaned = val.trim();

  // Match DD-MMM-YYYY or DD/MMM/YYYY (e.g., 05-Oct-2024)
  const dMmmY = cleaned.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{2,4})$/);
  if (dMmmY) {
    const month = MONTHS[dMmmY[2].toLowerCase()];
    return month === undefined ? null : buildDate(parseInt(dMmmY[3], 10), month, parseInt(dMmmY[1], 10));
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    return buildDate(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
  }

  // Match YYYY-MM-DD (optionally followed by a time)
  const ymd = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ].*)?$/);
  if (ymd) {
    return buildDate(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10));
  }

  return null;
}

// Splits a header into lowercase words, so "Description" is not read as containing "cr"
const headerWords = (header: string) => header.toLowerCase().split(/[^a-z]+/).filter(Boolean);
const hasWord = (header: string, words: string[]) => headerWords(header).some((w) => words.includes(w));

/**
 * Parse CSV raw text split by rows and commas (handling quotes).
 */
function parseCSVRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let insideQuotes = false;
    let current = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export interface SkippedStatementRow {
  row: number; // 1 = first row after the header
  reason: string;
}

export interface ParsedBankStatement {
  transactions: ParsedBankTransaction[];
  skippedRows: SkippedStatementRow[];
}

/**
 * Parses statement files from ComBank, HNB, Sampath, BOC, FriMi or generic bank CSV exports.
 * Rows that can't be read (for example an invalid date) are skipped and listed in skippedRows.
 */
export function parseBankStatement(
  csvText: string,
  bankType: SupportedSriLankanBank = "generic"
): ParsedBankStatement {
  const result: ParsedBankStatement = { transactions: [], skippedRows: [] };
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) {
    return result;
  }

  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rLower = rows[i].map((c) => c.toLowerCase());
    if (
      rLower.some((c) => c.includes("date") || c.includes("txn date") || c.includes("value date")) &&
      rLower.some((c) => c.includes("description") || c.includes("particulars") || c.includes("narrative") || c.includes("details") || c.includes("remarks"))
    ) {
      headerIndex = i;
      break;
    }
  }

  // If no header found, assume row 0 is header
  if (headerIndex === -1) {
    headerIndex = 0;
  }

  const headers = rows[headerIndex].map((h) => h.toLowerCase());
  const dataRows = rows.slice(headerIndex + 1);

  // Column identification indices. Short codes like "dr" / "cr" are matched as whole words,
  // so "Description" is not taken as the credit column.
  const dateCol = headers.findIndex((h) => hasWord(h, ["date"]));
  const descCol = headers.findIndex((h) =>
    h.includes("description") ||
    h.includes("particulars") ||
    h.includes("narrative") ||
    h.includes("details") ||
    h.includes("remarks")
  );
  // A "Dr/Cr" or "Type" column says which way the money went; it is not an amount column
  const typeCol = headers.findIndex((h) =>
    hasWord(h, ["type"]) || (hasWord(h, ["dr", "debit"]) && hasWord(h, ["cr", "credit"]))
  );
  const debitCol = headers.findIndex((h, i) =>
    i !== typeCol && hasWord(h, ["debit", "debits", "withdrawal", "withdrawals", "dr"])
  );
  const creditCol = headers.findIndex((h, i) =>
    i !== typeCol && hasWord(h, ["credit", "credits", "deposit", "deposits", "cr"])
  );
  const amountCol = headers.findIndex((h, i) =>
    i !== debitCol && i !== creditCol && hasWord(h, ["amount", "amt"])
  );
  const balanceCol = headers.findIndex((h) => h.includes("balance"));
  const refCol = headers.findIndex((h) => hasWord(h, ["ref", "reference", "chq", "cheque"]));

  dataRows.forEach((row, index) => {
    const rowNumber = index + 1;
    if (!row || row.length <= Math.max(dateCol, descCol)) return;

    const rawDate = dateCol !== -1 ? row[dateCol] : undefined;
    const rawDesc = descCol !== -1 ? row[descCol] : "";
    if (!rawDate && !rawDesc) return;

    const description = (rawDesc || "").replace(/\s+/g, " ").trim();
    if (description.toLowerCase().includes("opening balance") || description.toLowerCase().includes("closing balance")) {
      return;
    }
    if (!description) {
      result.skippedRows.push({ row: rowNumber, reason: "Missing description" });
      return;
    }

    const date = parseDateFlexible(rawDate);
    if (!date) {
      result.skippedRows.push({ row: rowNumber, reason: `Invalid date "${rawDate || ""}"` });
      return;
    }

    let amount = 0;
    let type: "income" | "expense" = "expense";

    // Scenario 1: Separate Debit and Credit columns (e.g. ComBank, HNB, Sampath standard CSV)
    if (debitCol !== -1 && creditCol !== -1) {
      const debitVal = parseMoney(row[debitCol]);
      const creditVal = parseMoney(row[creditCol]);

      if (creditVal > 0) {
        amount = creditVal;
        type = "income";
      } else if (debitVal > 0) {
        amount = debitVal;
        type = "expense";
      } else if (amountCol !== -1) {
        // Fallback
        const rawAmt = parseMoney(row[amountCol]);
        amount = Math.abs(rawAmt);
        type = rawAmt >= 0 ? "income" : "expense";
      }
    } else if (amountCol !== -1) {
      // Scenario 2: Single amount column with a Dr/Cr column or sign
      const rawAmt = parseMoney(row[amountCol]);
      const signOrType = typeCol !== -1 ? (row[typeCol] || "").trim().toUpperCase() : "";

      if (["CR", "C"].includes(signOrType) || signOrType.includes("CREDIT") || signOrType.includes("INCOME")) {
        amount = Math.abs(rawAmt);
        type = "income";
      } else if (["DR", "D"].includes(signOrType) || signOrType.includes("DEBIT") || signOrType.includes("EXPENSE")) {
        amount = Math.abs(rawAmt);
        type = "expense";
      } else {
        amount = Math.abs(rawAmt);
        type = rawAmt >= 0 ? "income" : "expense";
      }
    }

    if (amount <= 0) {
      result.skippedRows.push({ row: rowNumber, reason: "Missing or zero amount" });
      return;
    }

    const balance = balanceCol !== -1 ? parseMoney(row[balanceCol]) : undefined;
    const reference = refCol !== -1 ? row[refCol]?.trim() || undefined : undefined;

    result.transactions.push({
      date,
      description,
      amount,
      type,
      balance,
      category: inferCategory(description, type),
      reference,
      sourceAccount: `${bankType.toUpperCase()}_STATEMENT`,
    });
  });

  return result;
}

export function parseBankStatementCSV(
  csvText: string,
  bankType: SupportedSriLankanBank = "generic"
): ParsedBankTransaction[] {
  return parseBankStatement(csvText, bankType).transactions;
}

/**
 * For each transaction, how many identical rows (same date, amount, type and description)
 * came before it in the file, starting at 1. Two real coffees for the same price on the same day
 * get 1 and 2, so the second isn't mistaken for a duplicate, while importing the same file
 * again produces the same numbers and is still skipped.
 */
export function statementOccurrences(transactions: ParsedBankTransaction[]): number[] {
  const seen = new Map<string, number>();
  return transactions.map((t) => {
    const key = [t.date.toISOString(), t.amount.toFixed(2), t.type, t.description.toLowerCase()].join("|");
    const count = (seen.get(key) || 0) + 1;
    seen.set(key, count);
    return count;
  });
}
