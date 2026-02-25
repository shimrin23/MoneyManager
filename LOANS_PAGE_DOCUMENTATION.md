# Loans Page - Components Documentation

## Overview
The **LoansPage** is the main component that orchestrates all loan management features. It uses a **tab-based interface** where users can view different loan-related information by clicking on tabs.

---

## Main Component: LoansPage.tsx

### What It Does
- Manages the overall loan management interface
- Handles state for active tabs, selected loans, edit modals
- Routes between different tabs (Overview, Calculator, Schedule, etc.)
- Manages loan CRUD operations (Create, Read, Update, Delete)

### Why It's Used
- Centralized hub for all loan-related features
- Keeps the app organized by grouping related functionality
- Handles navigation and data flow between components

---

## Tab-Based Interface

The LoansPage has **7 tabs** that show different features:

### 1. **Overview Tab** ⭐
**Shows:** 
- `LoanAlerts` component - Displays important loan notifications & due dates
- `ActiveLoanCards` component - Shows all active loans with quick action buttons

**Why:**
- Gives users a quick glance of their current loan status
- Displays critical alerts they need to know about

---

### 2. **Calculator Tab** 🧮
**Component:** `LoanCalculator`

**What It Does:**
- Allows users to calculate EMI (Equated Monthly Installment)
- Takes input: Principal amount, Interest rate, Tenure
- Shows the calculated EMI and other loan details

**Why It's Used:**
- Helps users plan before taking a loan
- Shows the cost breakdown of a loan

**Example Calculation:**
```
Principal: Rs 5,00,000
Interest Rate: 8% per year
Tenure: 60 months
Result: Monthly EMI = Rs 9,606.67
```

---

### 3. **Schedule Tab** 📅
**Component:** `RepaymentSchedule`

**What It Does:**
- Shows a **month-by-month breakdown** of loan repayment
- Displays: Principal amount, Interest amount, Total EMI, Remaining balance for each month
- Helps visualize how the loan reduces over time

**Why It's Used:**
- Users can see exactly how much principal and interest they're paying each month
- Helps with financial planning

**Example Row:**
```
Month 1: Principal: Rs 2,000 | Interest: Rs 3,333 | EMI: Rs 5,333 | Balance: Rs 498,000
Month 2: Principal: Rs 2,050 | Interest: Rs 3,283 | EMI: Rs 5,333 | Balance: Rs 495,950
```

---

### 4. **Strategies Tab** 💡
**Component:** `DebtPayoffStrategies`

**What It Does:**
- Shows two debt payoff methods:
  1. **Snowball Method** - Pay off smallest loan first (motivational)
  2. **Avalanche Method** - Pay off highest interest loan first (saves money)

**Why It's Used:**
- Helps users decide the best strategy to pay off multiple loans
- Snowball = quick wins, Avalanche = save most money

---

### 5. **Simulation Tab** 🔮
**Component:** `WhatIfSimulation`

**What It Does:**
- Simulates different loan scenarios:
  1. **Increased EMI** - What if you pay more per month?
  2. **Lump Sum Payment** - What if you pay a large amount upfront?
  3. **Refinance** - What if you change interest rate?

**Why It's Used:**
- Users can see how different actions affect their loan
- Helps with decision-making before making financial changes

**Example:**
```
Current: Rs 10,000/month, 60 months = Rs 6,00,000 total
Increased to Rs 15,000: 40 months = Rs 6,00,000 total (SAVES 20 MONTHS!)
```

---

### 6. **Insights Tab** 🤖
**Component:** `AiLoanInsights`

**What It Does:**
- Uses AI/ML to provide personalized loan recommendations
- Analyzes your loans and suggests improvements
- Example: "Consider refinancing at lower interest rate"

**Why It's Used:**
- Provides smart, actionable advice
- Helps optimize loan management

---

### 7. **Debt-to-Income Tab** 📊
**Component:** `LoanToIncomeRatio`

**What It Does:**
- Calculates your **debt-to-income ratio** (DTI)
- Formula: `Total Monthly Debt / Monthly Income × 100`
- Shows if you're taking too much debt

**Why It's Used:**
- Banks use DTI to approve loans
- Helps you understand if you can afford new loans
- Financial health indicator

**Example:**
```
Monthly Income: Rs 50,000
Total Monthly Debt: Rs 15,000
DTI = 30% (Good - under 43% is safe)
```

---

## Key Components Used

### 1. **ActiveLoanCards** 🏦
**Location:** `src/components/ActiveLoanCards.tsx`

**Shows:**
- All active loans in a grid layout
- For each loan: EMI, Remaining Amount, Interest Rate, Due Date
- Action buttons: View Schedule, Recalculate, Pay EMI, Edit (✏️), Delete (🗑️)

**Layout:**
```
┌─────────────────────────────┐
│ Vehicle Loan      [Edit] [Delete]
├─────────────────────────────┤
│ Monthly EMI: Rs 17,029.98    │
│ Remaining: Rs 204,359.77     │
│ Interest Rate: 4% p.a.       │
│ Due Date: 11/03/2026         │
├─────────────────────────────┤
│ [View Schedule] [Recalculate] [Pay EMI] │
└─────────────────────────────┘
```

---

### 2. **LoanAlerts** ⚠️
**Location:** `src/components/LoanAlerts.tsx`

**Shows:**
- Upcoming due dates
- Overdue loans
- Important notifications

**Example:**
```
🔔 Due Today: Vehicle Loan - Rs 10,000 due
⚠️ Overdue: Personal Loan - Rs 5,000 overdue by 3 days
```

---

### 3. **Edit Loan Modal** ✏️
**What It Does:**
- Popup dialog when user clicks Edit button
- Allows changing: Provider, Interest Rate, Tenure, EMI, Status, Due Date

**Form Fields:**
```
Provider: [ICICI Bank        ]
Interest Rate: [8.5]  Tenure: [60]
Monthly EMI: [10000]  Status: [Active ▼]
Next Due Date: [2026-02-15]
[Cancel] [Save Changes]
```

**Why:**
- Users can update loan information
- Non-invasive - doesn't navigate away
- Clear confirmation before saving

---

### 4. **Hook: useLoans** 🪝
**Location:** `src/hooks/useLoans.ts`

**What It Provides:**
- `loans` - Array of all loans
- `loading` - Boolean (is data loading?)
- `error` - Error message if something fails
- `fetchLoans()` - Reload loan data
- `updateLoan()` - Update a loan
- `deleteLoan()` - Delete a loan
- Various calculation methods (EMI, Schedule, etc.)

**Why:**
- Reusable logic for API calls
- Keeps components clean
- Centralized data management

---

## Data Flow Diagram

```
┌─────────────────┐
│   LoansPage     │ (Main Container)
│   - Manages     │
│   - Tabs, State │
└────────┬────────┘
         │
    ┌────┴──────────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌──────────────┐                    ┌─────────────────┐
│ Overview Tab │                    │ Calculator Tab  │
├──────────────┤                    ├─────────────────┤
│ LoanAlerts   │                    │ LoanCalculator  │
│ ActiveCards  │                    │ (Add new loan)  │
└──────────────┘                    └─────────────────┘
    │
    └─ User clicks Edit ✏️
       │
       ▼
    Edit Modal appears
    │
    └─ User clicks Save
       │
       ▼
    useLoans hook calls API
    │
    ▼
    Database updates
```

---

## State Management

### Variables Tracked:
```typescript
activeTab: 'overview' | 'calculator' | 'schedule' | 'strategies' | 'simulation' | 'insights' | 'ratio'
// Currently selected tab

selectedLoan: string | null
// Which loan is currently selected (for Schedule, Simulation)

showEditModal: boolean
// Is the edit modal open?

editError: string | null
// Error message when editing fails

editForm: {
  loanId: string
  provider: string
  interestRate: number
  tenure: number
  monthlyInstallment: number
  status: 'Active' | 'Closed' | 'Overdue'
  nextDueDate: string
}
// Form data for editing
```

---

## Key Functions

### 1. **handleViewSchedule(loanId)**
- Switches to Schedule tab with selected loan
- User: Clicks "View Schedule" button → Sees repayment schedule

### 2. **handleRecalculate(loanId)**
- Switches to Calculator tab
- User: Clicks "Recalculate" button → Can recalculate EMI

### 3. **handleEditLoan(loanId)**
- Opens edit modal with loan details pre-filled
- User: Clicks ✏️ icon → Modal opens with current data

### 4. **handleEditSubmit()**
- Validates and sends updated data to API
- Calls `updateLoan()` from useLoans hook
- Closes modal and refreshes data

### 5. **handleDeleteLoan(loanId)**
- Shows confirmation dialog
- If confirmed, calls `deleteLoan()` API
- Refreshes loan list

---

## CSS Classes

### Card Styling
```css
.loan-card              /* Main card container */
.card-header           /* Top section with title */
.header-actions        /* Edit/Delete icons in top-right */
.card-content          /* Loan details (EMI, Balance, etc) */
.card-actions          /* Bottom buttons (View Schedule, etc) */
.progress-bar          /* Visual progress indicator */
```

### Button Styling
```css
.btn-primary           /* Blue buttons (Pay EMI, Save) */
.btn-secondary         /* Gray buttons (View Schedule, Recalculate) */
.btn-danger            /* Red delete button */
.btn-header-icon       /* Circular icons (Edit/Delete in top-right) */
```

---

## User Journey Example

1. User opens app → Sees **Overview Tab**
   - Views active loans
   - Sees important alerts

2. User clicks "View Schedule" → Switches to **Schedule Tab**
   - Sees month-by-month breakdown

3. User clicks "Calculate New Loan" → **Calculator Tab**
   - Enters loan details
   - Creates new loan

4. User clicks ✏️ icon on loan → **Edit Modal**
   - Changes interest rate
   - Saves changes

5. User wants to explore scenarios → **Simulation Tab**
   - Sees what happens with increased EMI
   - Sees how lump sums affect timeline

6. User checks financial health → **Debt-to-Income Tab**
   - Sees debt ratio
   - Gets advice on affordability

---

## Why This Architecture?

✅ **Tab-Based Design**
- Keeps all loan features organized
- Users find what they need quickly
- Scalable (easy to add new tabs)

✅ **Component Separation**
- Each component has ONE responsibility
- Easy to test and maintain
- Reusable across different pages

✅ **Custom Hook (useLoans)**
- Centralizes API calls
- Multiple components can use same data
- Reduces code duplication

✅ **Modal for Editing**
- Non-disruptive user experience
- Clear form with validation
- Easy to cancel without losing data

✅ **Dark Theme**
- Easy on eyes during long sessions
- Professional appearance
- Consistent with modern apps

---

## Summary Table

| Component | Purpose | Tab | Key Feature |
|-----------|---------|-----|-------------|
| LoanAlerts | Show notifications | Overview | Critical info at a glance |
| ActiveLoanCards | Display active loans | Overview | Quick actions, card layout |
| LoanCalculator | Calculate EMI | Calculator | Plan new loans |
| RepaymentSchedule | Show payment breakdown | Schedule | Month-by-month view |
| DebtPayoffStrategies | Compare strategies | Strategies | Snowball vs Avalanche |
| WhatIfSimulation | Test scenarios | Simulation | What-if analysis |
| AiLoanInsights | AI recommendations | Insights | Smart suggestions |
| LoanToIncomeRatio | Calculate DTI | Debt-to-Income | Financial health check |

---

## Next Steps for Enhancement

- Add payment history tracking
- Implement loan comparison tools
- Add SMS/Email alerts
- Export reports (PDF)
- Mobile-optimized view
- Dark theme toggle
