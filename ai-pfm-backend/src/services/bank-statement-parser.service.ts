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
 */
export function inferCategory(description: string): string {
  const desc = description.toUpperCase();

  if (/KEELLS|CARGILLS|ARPICO|SPAR|GLOMARK|SUPERMARKET|GROCERY/.test(desc)) {
    return "Groceries";
  }
  if (/CEB|LECO|WATER BOARD|NWSDB|SLT|DIALOG|MOBITEL|AIRTEL|HUTCH|ELECTRICITY|TELECOM|UTILITY/.test(desc)) {
    return "Utilities";
  }
  if (/UBER|PICKME|TAXI|FUEL|IOC|PETROL|SHED|RAILWAY|HIGHWAY|TOLL/.test(desc)) {
    return "Transportation";
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
  if (/SALARY|PAYROLL|DIVIDEND|REMITTANCE|INTEREST CREDITED/.test(desc)) {
    return "Income";
  }
  if (/NETFLIX|SPOTIFY|PRIME|CINEMA|MOVIE|ENTERTAINMENT/.test(desc)) {
    return "Entertainment";
  }
  if (/ATM WDL|CASH WDL|WITHDRAWAL/.test(desc)) {
    return "Cash & ATM";
  }
  if (/INSURANCE|CEYLINCO|AIA|SLIC|UNION ASSURANCE/.test(desc)) {
    return "Insurance";
  }
  return "General";
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

/**
 * Robust date parser supporting DD/MM/YYYY, YYYY-MM-DD, DD-MMM-YYYY (e.g. 05-Oct-2024), MM/DD/YYYY
 */
function parseDateFlexible(val: string | undefined): Date {
  if (!val) return new Date();
  const cleaned = val.trim();

  // Match DD-MMM-YYYY or DD/MMM/YYYY (e.g., 05-Oct-2024)
  const dMmmY = cleaned.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{2,4})$/);
  if (dMmmY) {
    const day = parseInt(dMmmY[1], 10);
    const monthStr = dMmmY[2].toLowerCase();
    let year = parseInt(dMmmY[3], 10);
    if (year < 100) year += 2000;
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    if (monthStr in months) {
      return new Date(Date.UTC(year, months[monthStr], day));
    }
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    let year = parseInt(dmy[3], 10);
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month, day));
  }

  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? new Date() : d;
}

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

/**
 * Parses statement files from ComBank, HNB, Sampath, BOC, FriMi or generic bank CSV exports.
 */
export function parseBankStatementCSV(
  csvText: string,
  bankType: SupportedSriLankanBank = "generic"
): ParsedBankTransaction[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) {
    return [];
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

  // Column identification indices
  const dateCol = headers.findIndex((h) => h.includes("date"));
  const descCol = headers.findIndex((h) =>
    h.includes("description") ||
    h.includes("particulars") ||
    h.includes("narrative") ||
    h.includes("details") ||
    h.includes("remarks")
  );
  const debitCol = headers.findIndex((h) => h.includes("debit") || h.includes("withdrawal") || h.includes("dr"));
  const creditCol = headers.findIndex((h) => h.includes("credit") || h.includes("deposit") || h.includes("cr"));
  const amountCol = headers.findIndex((h) => h.includes("amount"));
  const typeCol = headers.findIndex((h) => h.includes("type") || h.includes("dr/cr") || h.includes("cr/dr"));
  const balanceCol = headers.findIndex((h) => h.includes("balance"));
  const refCol = headers.findIndex((h) => h.includes("ref") || h.includes("chq") || h.includes("cheque") || h.includes("reference"));

  const parsedTransactions: ParsedBankTransaction[] = [];

  for (const row of dataRows) {
    if (!row || row.length <= Math.max(dateCol, descCol)) continue;

    const rawDate = dateCol !== -1 ? row[dateCol] : undefined;
    const rawDesc = descCol !== -1 ? row[descCol] : "";
    if (!rawDate || !rawDesc) continue;

    const date = parseDateFlexible(rawDate);
    const description = rawDesc.replace(/\s+/g, " ").trim();
    if (!description || description.toLowerCase().includes("opening balance") || description.toLowerCase().includes("closing balance")) {
      continue;
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
      const signOrType = typeCol !== -1 ? (row[typeCol] || "").toUpperCase() : "";

      if (signOrType.includes("CR") || signOrType.includes("CREDIT") || signOrType.includes("INCOME")) {
        amount = Math.abs(rawAmt);
        type = "income";
      } else if (signOrType.includes("DR") || signOrType.includes("DEBIT")) {
        amount = Math.abs(rawAmt);
        type = "expense";
      } else {
        amount = Math.abs(rawAmt);
        type = rawAmt >= 0 ? "income" : "expense";
      }
    }

    if (amount <= 0) {
      continue;
    }

    const balance = balanceCol !== -1 ? parseMoney(row[balanceCol]) : undefined;
    const reference = refCol !== -1 ? row[refCol]?.trim() : undefined;
    const category = inferCategory(description);

    parsedTransactions.push({
      date,
      description,
      amount,
      type,
      balance,
      category,
      reference,
      sourceAccount: `${bankType.toUpperCase()}_STATEMENT`,
    });
  }

  return parsedTransactions;
}
