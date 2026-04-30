import { SimulatedBankFeedService } from "../../src/services/simulated-bank-feed.service";

describe("SimulatedBankFeedService", () => {
  it("generates a deterministic JSON feed for the same seed", () => {
    const service = new SimulatedBankFeedService();

    const firstFeed = service.generateFeed({
      userId: "user-123",
      accountId: "acct-456",
      accountName: "Everyday Checking",
      transactionCount: 8,
      days: 14,
      endDate: new Date("2026-05-01T12:00:00.000Z"),
      seed: "fixed-seed",
    });

    const secondFeed = service.generateFeed({
      userId: "user-123",
      accountId: "acct-456",
      accountName: "Everyday Checking",
      transactionCount: 8,
      days: 14,
      endDate: new Date("2026-05-01T12:00:00.000Z"),
      seed: "fixed-seed",
    });

    expect(secondFeed).toEqual(firstFeed);
    expect(firstFeed.source).toBe("simulated-bank");
    expect(firstFeed.transactions).toHaveLength(8);
    expect(firstFeed.summary.transactionCount).toBe(8);
    expect(firstFeed.summary.totalIncome).toBeGreaterThanOrEqual(0);
    expect(firstFeed.summary.totalExpenses).toBeGreaterThanOrEqual(0);
    expect(firstFeed.transactions[0]).toHaveProperty("merchantName");
    expect(firstFeed.transactions[0]).toHaveProperty("mcc");
    expect(firstFeed.transactions[0]).toHaveProperty("ingestionType", "batch");
  });
});
