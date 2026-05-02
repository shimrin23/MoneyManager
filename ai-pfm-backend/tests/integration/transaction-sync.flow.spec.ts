import request from "supertest";

const users: any[] = [];
const consents: any[] = [];
const transactions: any[] = [];
const syncStates: any[] = [];

// Ensure banking integration uses the built-in mock feed during tests
process.env.BANKING_MOCK_ENABLED = 'true';

const findUserByEmail = (email: string) => users.find((u) => u.email === email);

class MockUserModel {
  static async findOne(query: any) {
    if (query.email) {
      return findUserByEmail(query.email) || null;
    }
    return null;
  }

  static async create(data: any) {
    const user = {
      _id: `user-${users.length + 1}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  }

  static findById(id: string, projection?: any) {
    const user = users.find((u) => String(u._id) === String(id));

    if (projection) {
      return {
        lean: async () => {
          if (!user) return null;
          if (projection.bankAccounts) {
            return { bankAccounts: user.bankAccounts };
          }
          return user;
        },
      };
    }

    return {
      select: () => ({
        then: (resolve: any) => resolve(user || null),
      }),
    } as any;
  }

  static find() {
    return {
      lean: async () => users.map((u) => ({ _id: u._id })),
    };
  }
}

class MockConsentModel {
  data: any;
  _id: string;

  constructor(data: any) {
    this.data = data;
    this._id = `consent-${consents.length + 1}`;
  }

  async save() {
    const entry = {
      _id: this._id,
      ...this.data,
    };
    consents.push(entry);
    return entry;
  }

  static async updateMany(filter: any, update: any) {
    let modifiedCount = 0;
    for (const consent of consents) {
      if (
        consent.userId === filter.userId &&
        consent.consentType === filter.consentType &&
        consent.status === filter.status
      ) {
        Object.assign(consent, update);
        modifiedCount += 1;
      }
    }

    return { modifiedCount };
  }

  static async findOne(filter: any) {
    return (
      consents.find(
        (c) =>
          c.userId === filter.userId &&
          c.consentType === filter.consentType &&
          c.status === filter.status,
      ) || null
    );
  }

  static find(filter: any) {
    const result = consents.filter((c) => {
      if (filter?.userId && c.userId !== filter.userId) return false;
      if (filter?.status && c.status !== filter.status) return false;
      return true;
    });

    return {
      sort: async () => result,
    } as any;
  }

  static async aggregate() {
    return [];
  }

  static async countDocuments() {
    return consents.length;
  }
}

class MockAuditLog {
  constructor(private payload: any) {}

  async save() {
    return this.payload;
  }
}

class MockTransactionModel {
  static async bulkWrite(operations: any[]) {
    console.log('[MockTransactionModel] bulkWrite called, ops:', operations.length);
    let upsertedCount = 0;
    let modifiedCount = 0;
    let matchedCount = 0;

    for (const op of operations) {
      const filter = op.updateOne.filter;
      const updateSet = op.updateOne.update.$set;
      const existingIndex = transactions.findIndex(
        (t) => t.userId === filter.userId && t.syncKey === filter.syncKey,
      );

      if (existingIndex >= 0) {
        transactions[existingIndex] = {
          ...transactions[existingIndex],
          ...updateSet,
        };
        modifiedCount += 1;
        matchedCount += 1;
      } else {
        transactions.push({
          _id: `txn-${transactions.length + 1}`,
          ...updateSet,
        });
        upsertedCount += 1;
      }
    }

    return {
      upsertedCount,
      modifiedCount,
      matchedCount,
    };
  }

  static find(filter: any) {
    const userTransactions = transactions.filter((t) => {
      if (filter?.userId) {
        return t.userId === filter.userId;
      }
      return true;
    });

    return {
      sort: async () => userTransactions,
    } as any;
  }
}

class MockSyncStateModel {
  static async findOneAndUpdate(filter: any, update: any, options: any) {
    let state = syncStates.find(
      (s) => s.userId === filter.userId && s.sourceAccount === filter.sourceAccount,
    );

    if (!state && options?.upsert) {
      state = {
        userId: filter.userId,
        sourceAccount: filter.sourceAccount,
        ...(update.$setOnInsert || {}),
      };
      syncStates.push(state);
    }

    if (state && update.$set) {
      Object.assign(state, update.$set);
    }

    return state || null;
  }

  static async updateOne(filter: any, update: any) {
    let state = syncStates.find(
      (s) => s.userId === filter.userId && s.sourceAccount === filter.sourceAccount,
    );

    if (!state) {
      state = { userId: filter.userId, sourceAccount: filter.sourceAccount };
      syncStates.push(state);
    }

    if (update.$set) {
      Object.assign(state, update.$set);
    }

    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        state[key] = (state[key] || 0) + Number(val);
      }
    }

    return { acknowledged: true };
  }

  static find(filter: any) {
    const result = syncStates.filter((s) => s.userId === filter.userId);
    return {
      sort: () => ({
        lean: async () => result,
      }),
    } as any;
  }
}

jest.mock("../../src/schemas/user.schema", () => ({
  __esModule: true,
  default: MockUserModel,
}));

jest.mock("../../src/schemas/consent.schema", () => ({
  __esModule: true,
  default: MockConsentModel,
}));

jest.mock("../../src/schemas/audit_log.schema", () => ({
  __esModule: true,
  default: MockAuditLog,
}));

jest.mock("../../src/schemas/transaction.schema", () => ({
  __esModule: true,
  default: MockTransactionModel,
}));

jest.mock("../../src/schemas/sync_state.schema", () => ({
  __esModule: true,
  default: MockSyncStateModel,
}));

import app from "../../src/index";

describe("Transaction Sync Flow Integration", () => {
  beforeEach(() => {
    users.length = 0;
    consents.length = 0;
    transactions.length = 0;
    syncStates.length = 0;
  });

  it("runs signup -> consent -> sync -> verify dedupe", async () => {
    const email = `sync.${Date.now()}@example.com`;
    const password = "Test@1234";

    const signupResponse = await request(app).post("/api/auth/signup").send({
      name: "Sync Tester",
      email,
      password,
    });

    expect(signupResponse.status).toBe(201);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    const token = loginResponse.body.token;

    const consentResponse = await request(app)
      .post("/api/consent/grant")
      .set("Authorization", `Bearer ${token}`)
      .send({
        consentType: "pfm_analysis",
        version: "v1.0",
      });

    expect(consentResponse.status).toBe(201);

    const firstSyncResponse = await request(app)
      .post("/api/transactions/sync")
      .set("Authorization", `Bearer ${token}`)
      .send({ sourceAccounts: ["ACC-INT-001"] });

    expect(firstSyncResponse.status).toBe(200);

    // Verify transactions were inserted into the mocked transaction store
    expect(transactions.length).toBeGreaterThan(0);
    const firstCount = transactions.length;

    const secondSyncResponse = await request(app)
      .post("/api/transactions/sync")
      .set("Authorization", `Bearer ${token}`)
      .send({ sourceAccounts: ["ACC-INT-001"] });

    expect(secondSyncResponse.status).toBe(200);

    // Verify dedupe: transactions array should remain same size after second sync
    const secondCount = transactions.length;
    expect(secondCount).toBe(firstCount);

    // Verify sync state was recorded in the mocked syncStates store
    expect(syncStates.length).toBeGreaterThan(0);
    expect(syncStates[0].sourceAccount).toBe("ACC-INT-001");
    expect(syncStates[0].lastStatus).toBeDefined();
  });
});
