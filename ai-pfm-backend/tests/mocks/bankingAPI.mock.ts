export const mockBankingAPI = () => {
  // Enable built-in banking mock in BankingIntegration
  process.env.BANKING_MOCK_ENABLED = 'true';
};
