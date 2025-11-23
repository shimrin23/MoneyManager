import Transaction, { ITransaction } from '../schemas/transaction.schema';

export default class TransactionsService {
    
    // Create a new transaction
    async create(data: Partial<ITransaction>): Promise<ITransaction> {
        const transaction = new Transaction(data);
        return await transaction.save();
    }

    // Find a transaction by ID
    async findById(id: string): Promise<ITransaction | null> {
        return await Transaction.findById(id);
    }

    // Get all transactions
    async findAll(): Promise<ITransaction[]> {
        return await Transaction.find().sort({ date: -1 }); // Sort by newest first
    }

    // Update a transaction
    async update(id: string, data: Partial<ITransaction>): Promise<ITransaction | null> {
        return await Transaction.findByIdAndUpdate(id, data, { new: true });
    }

    // Delete a transaction
    async delete(id: string): Promise<ITransaction | null> {
        return await Transaction.findByIdAndDelete(id);
    }
}