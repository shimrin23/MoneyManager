import { schedule } from 'node-cron';
import { BankingIntegration } from '../integrations/banking.integration';
// import { TransactionRepository } from '../repositories/transaction.repository'; 

const bankingIntegration = new BankingIntegration();
// const transactionRepository = new TransactionRepository();

schedule('0 0 * * *', async () => {
    console.log(' Running scheduled daily bank sync...');
    try {
        // Use the class instance method
        const bankData = await bankingIntegration.fetchAccountData('SOME_ACCOUNT_ID');
        
        console.log('Scheduled sync fetched data:', bankData);
        
        // TODO: Add logic here to save to your repository
        // await transactionRepository.syncTransactions(bankData);
        
    } catch (error) {
        console.error(' Scheduled sync failed:', error);
    }
});