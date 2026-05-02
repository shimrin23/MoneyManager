import { buildTransactionSyncKey } from "../../src/services/transaction-sync.service";

describe("buildTransactionSyncKey", () => {
  it("uses external transaction id when present", () => {
    const key = buildTransactionSyncKey({
      userId: "u1",
      sourceAccount: "acc-1",
      externalTransactionId: "tx-123",
      amount: 200,
      description: "Payment",
      merchantName: "Store",
      date: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(key).toBe("ext:u1:acc-1:tx-123");
  });

  it("generates stable hash key when external id is missing", () => {
    const input = {
      userId: "u1",
      sourceAccount: "acc-1",
      amount: 200,
      description: "Payment",
      merchantName: "Store",
      date: new Date("2026-01-01T00:00:00.000Z"),
    };

    const key1 = buildTransactionSyncKey(input);
    const key2 = buildTransactionSyncKey(input);

    expect(key1).toEqual(key2);
    expect(key1.startsWith("hash:")).toBe(true);
  });

  it("changes hash when amount changes", () => {
    const base = {
      userId: "u1",
      sourceAccount: "acc-1",
      description: "Payment",
      merchantName: "Store",
      date: new Date("2026-01-01T00:00:00.000Z"),
    };

    const key1 = buildTransactionSyncKey({ ...base, amount: 200 });
    const key2 = buildTransactionSyncKey({ ...base, amount: 201 });

    expect(key1).not.toEqual(key2);
  });
});
