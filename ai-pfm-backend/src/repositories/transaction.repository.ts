export class TransactionRepository {
    private transactions: any[] = [];

    public create(transaction: any): void {
        this.transactions.push(transaction);
    }

    public findAll(): any[] {
        return this.transactions;
    }

    public findById(id: string): any | undefined {
        return this.transactions.find(transaction => transaction.id === id);
    }

    public update(id: string, updatedTransaction: any): boolean {
        const index = this.transactions.findIndex(transaction => transaction.id === id);
        if (index !== -1) {
            this.transactions[index] = { ...this.transactions[index], ...updatedTransaction };
            return true;
        }
        return false;
    }

    public delete(id: string): boolean {
        const index = this.transactions.findIndex(transaction => transaction.id === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            return true;
        }
        return false;
    }
}