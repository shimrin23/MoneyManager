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

    // Get all transactions for a user
    async findAll(userId?: string): Promise<ITransaction[]> {
        const filter = userId ? { userId } : {};
        return await Transaction.find(filter).sort({ date: -1 }); // Sort by newest first
    }

    // Alias for backward compatibility
    async getAll(userId?: string): Promise<ITransaction[]> {
        return await this.findAll(userId);
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