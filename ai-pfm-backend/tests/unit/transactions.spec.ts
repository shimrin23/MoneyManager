import TransactionsService from '../../src/services/transactions.service';

describe('TransactionsService (unit)', () => {
    let svc: TransactionsService;

    beforeEach(() => {
        svc = new TransactionsService();
    });

    it('delegates create and returns created object', async () => {
        const payload = { amount: 100, description: 'Test' } as any;
        const spy = jest.spyOn(svc, 'create').mockResolvedValue(payload);

        const res = await svc.create(payload);
        expect(spy).toHaveBeenCalledWith(payload);
        expect(res).toEqual(payload);
    });

    it('findById delegates and returns data', async () => {
        const expected = { _id: '1', amount: 50 } as any;
        const spy = jest.spyOn(svc, 'findById').mockResolvedValue(expected);

        const res = await svc.findById('1');
        expect(spy).toHaveBeenCalledWith('1');
        expect(res).toEqual(expected);
    });

    it('update delegates and returns updated', async () => {
        const updated = { _id: '1', amount: 75 } as any;
        const spy = jest.spyOn(svc, 'update').mockResolvedValue(updated);

        const res = await svc.update('1', { amount: 75 } as any);
        expect(spy).toHaveBeenCalled();
        expect(res).toEqual(updated);
    });

    it('delete delegates and returns result', async () => {
        const spy = jest.spyOn(svc, 'delete').mockResolvedValue({ deleted: true } as any);

        const res = await svc.delete('1');
        expect(spy).toHaveBeenCalledWith('1');
        expect(res).toEqual({ deleted: true } as any);
    });
});