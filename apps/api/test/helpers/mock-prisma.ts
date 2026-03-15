/**
 * PrismaService mock factory for unit tests.
 * Creates a mock with jest.fn() for all Prisma model methods.
 */
export function createMockPrismaService() {
    const modelMethods = {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
    };

    const models = [
        'user', 'role', 'permission', 'userRole', 'rolePermission', 'userScope',
        'barangay', 'serviceZone', 'partner', 'partnerAgreement', 'revenueShareRule',
        'servicePlan', 'subscriber', 'subscription', 'networkAssetType', 'networkAsset',
        'oltPort', 'splitter', 'distributionBox', 'ontDevice', 'fiberSegment',
        'installationJob', 'serviceTicket', 'ticketNote',
        'billingCycle', 'invoice', 'invoiceLine', 'payment', 'adjustment', 'writeOff',
        'accountLedgerEntry', 'suspensionAction',
        'settlement', 'settlementLine', 'settlementAdjustment', 'partnerStatement',
        'auditLog', 'systemSetting', 'refreshToken', 'session',
    ];

    const mock: Record<string, any> = {
        $transaction: jest.fn((fn) => fn(mock)),
    };

    for (const model of models) {
        mock[model] = { ...modelMethods };
        // Re-create jest.fn() for each model to avoid shared references
        for (const method of Object.keys(modelMethods)) {
            (mock[model] as any)[method] = jest.fn();
        }
    }

    return mock;
}
