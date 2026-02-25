# Integration Guide - Loan Management System

## Step 1: Import the Loans Page in Your Main App

### In your `App.tsx` or routing file:

```typescript
import LoansPage from './components/LoansPage';

// Add to your router:
<Route path="/loans" element={<LoansPage />} />
```

## Step 2: Add Navigation Link

```typescript
// In your navigation menu:
<NavLink to="/loans">
  Loan Management
</NavLink>
```

## Step 3: Ensure Backend Routes are Registered

### In your `src/server.ts` or main backend file:

```typescript
import loansRouter from './routes/loans.routes';

// Mount the routes
app.use('/api/loans', loansRouter);
```

## Step 4: Verify User Schema Has monthlyIncome Field

The system needs `monthlyIncome` for calculations. Ensure your User schema includes:

```typescript
interface IUser {
  // ... existing fields
  monthlyIncome?: number;  // For loan calculations
}

// In schema:
monthlyIncome: { type: Number, default: 50000 }
```

## Step 5: Import Styles in Your Main CSS

```css
@import './components/LoansPage.css';
@import './components/LoanCalculator.css';
```

Or import in your main App component:

```typescript
import './components/LoansPage.css';
import './components/LoanCalculator.css';
```

---

## Testing the Loan System

### 1. Test EMI Calculator
- Navigate to `/loans`
- Click "Calculator" tab
- Enter sample data:
  - Loan Type: Personal
  - Bank: Test Bank
  - Amount: ₹500,000
  - Interest: 8.5%
  - Tenure: 60 months
- Click "Calculate EMI"

### 2. Test Loan Creation
- Complete the calculation
- Click "Create Loan"
- Verify loan appears in the loans list

### 3. Test View Schedule
- From loans overview, click "View Schedule" on an active loan
- Should display full month-wise payment schedule

### 4. Test Debt Payoff Strategies
- Create at least 2 loans with different amounts and interest rates
- Click "Strategies" tab
- Should show Snowball and Avalanche comparison

### 5. Test Loan Alerts
- System automatically generates alerts
- Alerts appear on Overview tab
- Close alerts with × button

### 6. Test AI Insights
- Click "Insights" tab
- Should display personalized recommendations
- Click "Refresh" to regenerate

### 7. Test Debt-to-Income Ratio
- Click "Debt-to-Income" tab
- Should show ratio with risk level
- Verify recommendation matches risk level

### 8. Test What-If Simulation
- Select a loan from Active Loan Cards
- Click "Simulation" tab (if visible)
- Try different scenarios:
  - Increase EMI
  - Lump Sum Payment
  - Refinancing

---

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/loans/calculate-emi` | Calculate EMI |
| POST | `/api/loans/repayment-schedule` | Get payment schedule |
| POST | `/api/loans` | Create new loan |
| GET | `/api/loans` | Get all user loans |
| GET | `/api/loans/:id/alerts` | Get loan alerts |
| GET | `/api/loans/debt-payoff-strategies` | Get strategies |
| GET | `/api/loans/loan-to-income-ratio` | Get DTI ratio |
| GET | `/api/loans/ai-insights` | Get AI insights |
| PUT | `/api/loans/:id` | Update loan |
| DELETE | `/api/loans/:id` | Delete loan |
| POST | `/api/loans/:id/payment` | Record payment |
| POST | `/api/loans/:id/simulate-increased-emi` | Simulate EMI increase |
| POST | `/api/loans/:id/simulate-lump-sum` | Simulate lump sum |
| POST | `/api/loans/:id/simulate-refinance` | Simulate refinancing |

---

## Customization Options

### 1. Default Monthly Income
- Can be set per user in User schema
- If not provided, defaults to ₹50,000
- Modify in: `LoanService` methods

### 2. Alert Thresholds
**EMI Due Soon**: Default 7 days before due date
- Edit in: `LoanService.generateLoanAlerts()`

**EMI to Income Ratios**:
- Low: 0-20% (customize in `calculateLoanToIncomeRatio()`)
- Medium: 20-35%
- High: 35-50%
- Critical: 50%+

### 3. Loan Types
Current types: `Personal | Home | Vehicle | Education | Lease | Pawning`
- Add more in: `ILoan` interface and schema enum

### 4. Colors & Styling
- Edit CSS files for your brand colors
- Current theme: Blue (#3b82f6 primary)

---

## Troubleshooting

### Issue: 404 on loan APIs
**Solution**: Ensure `/api/loans` route is properly registered in server

```typescript
app.use('/api/loans', loansRouter);
```

### Issue: User schema doesn't have monthlyIncome
**Solution**: Add to User schema:
```typescript
monthlyIncome: { type: Number, default: 50000 }
```

### Issue: Components not rendering
**Solution**: Verify imports:
```typescript
import { useLoans } from '../hooks/useLoans';
import LoansPage from './LoansPage';
```

### Issue: API calls failing
**Solution**: Ensure authentication middleware is working:
```typescript
router.use(authenticateToken); // In loans.routes.ts
```

---

## Performance Optimization Tips

1. **Pagination for large loan lists**
   - Consider adding pagination to `GET /api/loans`

2. **Caching calculations**
   - Cache EMI calculations for repeated values

3. **Lazy load components**
   - Use React.lazy() for schedule and simulation components

4. **Database indexing**
   - Add indexes on userId, status fields for faster queries

---

## Security Considerations

✅ All endpoints require authentication via `authenticateToken`
✅ Users can only access their own loans
✅ Loan updates are scoped to user ID
✅ Sensitive calculations happen server-side

**Best Practices**:
- Never expose monthlyIncome in frontend without encryption
- Validate all inputs server-side
- Log all loan operations for audit trail
- Consider rate limiting on EMI calculations

---

## Files Modified/Created

### Backend
- ✅ `src/schemas/loan.schema.ts` - Updated with new fields
- ✅ `src/services/loan.service.ts` - New service file
- ✅ `src/routes/loans.routes.ts` - Updated with new endpoints

### Frontend
- ✅ `src/hooks/useLoans.ts` - Custom hook for API calls
- ✅ `src/components/LoansPage.tsx` - Main loans hub
- ✅ `src/components/LoanCalculator.tsx` - EMI calculator
- ✅ `src/components/ActiveLoanCards.tsx` - Loan overview cards
- ✅ `src/components/RepaymentSchedule.tsx` - Payment schedule
- ✅ `src/components/DebtPayoffStrategies.tsx` - Strategy comparison
- ✅ `src/components/LoanAlerts.tsx` - Alert notifications
- ✅ `src/components/AiLoanInsights.tsx` - AI recommendations
- ✅ `src/components/LoanToIncomeRatio.tsx` - Risk assessment
- ✅ `src/components/WhatIfSimulation.tsx` - Scenario analysis
- ✅ `src/components/LoansPage.css` - Main styling
- ✅ `src/components/LoanCalculator.css` - Calculator styling

---

## Next Steps

1. ✅ Integrate into main app routing
2. ✅ Test all features thoroughly
3. ⭕ Add loan payment reminders (email/SMS)
4. ⭕ Add loan payoff progress visualization
5. ⭕ Integrate with bank APIs for real loan data
6. ⭕ Add export/print functionality for schedules
7. ⭕ Create mobile app version
8. ⭕ Add dark mode support
9. ⭕ Multi-language support
10. ⭕ Analytics dashboard for loan insights

---

## Support & Documentation

For detailed API documentation, see: `LOAN_FEATURES_DOCUMENTATION.md`

For component usage examples, check inline JSDoc comments in component files.

For schema details, see: `src/schemas/loan.schema.ts`
