import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Phase 0 Seed Data for FiberOps PH
 * Seeds: 12 roles, module permissions, role-permission mappings,
 * and a default Super Admin user.
 */
async function main() {
  console.log('🌱 Seeding FiberOps PH database...');

  // ========================================================================
  // 1. Seed Roles (12 per spec)
  // ========================================================================
  const roles = [
    { name: 'Super Admin', description: 'Full system access, all modules, all barangays', is_system_role: true },
    { name: 'Corporate Admin', description: 'Head office administrator with cross-barangay access', is_system_role: true },
    { name: 'Operations Manager', description: 'Manages operations across multiple barangays', is_system_role: true },
    { name: 'Barangay Manager', description: 'Manages a single barangay operations', is_system_role: true },
    { name: 'JV Partner Viewer', description: 'Read-only access to partner-scoped data', is_system_role: true },
    { name: 'Finance Officer', description: 'Billing, payments, settlements management', is_system_role: true },
    { name: 'Collection Officer', description: 'Payment collection and posting', is_system_role: true },
    { name: 'Network Engineer', description: 'Network asset management and topology', is_system_role: true },
    { name: 'Field Technician', description: 'Installation and ticket field operations', is_system_role: true },
    { name: 'Customer Service', description: 'Subscriber support and ticket management', is_system_role: true },
    { name: 'Auditor', description: 'Read-only compliance and audit log access', is_system_role: true },
    { name: 'Read-only Executive', description: 'Dashboard and report viewing only', is_system_role: true },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles[r.name] = r.id;
    console.log(`  ✅ Role: ${r.name}`);
  }

  // ========================================================================
  // 2. Seed Permissions (Phase 0 modules)
  // ========================================================================
  const permissionDefs = [
    // Users module
    { code: 'users.user.list', module: 'users', action: 'list', description: 'List users' },
    { code: 'users.user.view', module: 'users', action: 'view', description: 'View user details' },
    { code: 'users.user.create', module: 'users', action: 'create', description: 'Create user' },
    { code: 'users.user.update', module: 'users', action: 'update', description: 'Update user' },
    { code: 'users.user.deactivate', module: 'users', action: 'deactivate', description: 'Deactivate user' },
    { code: 'users.role.list', module: 'users', action: 'role_list', description: 'List roles' },
    { code: 'users.role.manage', module: 'users', action: 'role_manage', description: 'Manage roles and permissions' },

    // Barangays module
    { code: 'barangays.barangay.list', module: 'barangays', action: 'list', description: 'List barangays' },
    { code: 'barangays.barangay.view', module: 'barangays', action: 'view', description: 'View barangay details' },
    { code: 'barangays.barangay.create', module: 'barangays', action: 'create', description: 'Create barangay' },
    { code: 'barangays.barangay.update', module: 'barangays', action: 'update', description: 'Update barangay' },
    { code: 'barangays.zone.list', module: 'barangays', action: 'zone_list', description: 'List service zones' },
    { code: 'barangays.zone.manage', module: 'barangays', action: 'zone_manage', description: 'Manage service zones' },

    // Partners module
    { code: 'partners.partner.list', module: 'partners', action: 'list', description: 'List partners' },
    { code: 'partners.partner.view', module: 'partners', action: 'view', description: 'View partner details' },
    { code: 'partners.partner.create', module: 'partners', action: 'create', description: 'Create partner' },
    { code: 'partners.partner.update', module: 'partners', action: 'update', description: 'Update partner' },

    // Agreements module
    { code: 'agreements.agreement.list', module: 'agreements', action: 'list', description: 'List agreements' },
    { code: 'agreements.agreement.view', module: 'agreements', action: 'view', description: 'View agreement details' },
    { code: 'agreements.agreement.create', module: 'agreements', action: 'create', description: 'Create agreement' },
    { code: 'agreements.agreement.update', module: 'agreements', action: 'update', description: 'Update agreement' },

    // Plans module
    { code: 'plans.plan.list', module: 'plans', action: 'list', description: 'List service plans' },
    { code: 'plans.plan.view', module: 'plans', action: 'view', description: 'View plan details' },
    { code: 'plans.plan.create', module: 'plans', action: 'create', description: 'Create plan' },
    { code: 'plans.plan.update', module: 'plans', action: 'update', description: 'Update plan' },
    { code: 'plans.promo.manage', module: 'plans', action: 'promo_manage', description: 'Manage promos' },

    // Audit module
    { code: 'audit.log.list', module: 'audit', action: 'list', description: 'View audit logs' },

    // Settings module
    { code: 'settings.system.manage', module: 'settings', action: 'manage', description: 'Manage system settings' },

    // ========== Phase 1 Permissions ==========

    // Subscribers module
    { code: 'subscribers.subscriber.list', module: 'subscribers', action: 'list', description: 'List subscribers' },
    { code: 'subscribers.subscriber.view', module: 'subscribers', action: 'view', description: 'View subscriber' },
    { code: 'subscribers.subscriber.create', module: 'subscribers', action: 'create', description: 'Create subscriber' },
    { code: 'subscribers.subscriber.update', module: 'subscribers', action: 'update', description: 'Update subscriber' },
    { code: 'subscribers.subscriber.delete', module: 'subscribers', action: 'delete', description: 'Delete subscriber' },
    { code: 'subscribers.subscriber.change_status', module: 'subscribers', action: 'change_status', description: 'Change subscriber status' },
    { code: 'subscribers.subscriber.search', module: 'subscribers', action: 'search', description: 'Search subscribers' },

    // Network module
    { code: 'network.asset.list', module: 'network', action: 'list', description: 'List network assets' },
    { code: 'network.asset.view', module: 'network', action: 'view', description: 'View network asset' },
    { code: 'network.asset.create', module: 'network', action: 'create', description: 'Create network asset' },
    { code: 'network.asset.update', module: 'network', action: 'update', description: 'Update network asset' },
    { code: 'network.asset.delete', module: 'network', action: 'delete', description: 'Delete network asset' },
    { code: 'network.topology.view', module: 'network', action: 'topology_view', description: 'View network topology' },

    // Installations module
    { code: 'installations.job.list', module: 'installations', action: 'list', description: 'List installation jobs' },
    { code: 'installations.job.view', module: 'installations', action: 'view', description: 'View installation job' },
    { code: 'installations.job.assign', module: 'installations', action: 'assign', description: 'Assign technician' },
    { code: 'installations.job.update_status', module: 'installations', action: 'update_status', description: 'Update job status' },
    { code: 'installations.job.activate', module: 'installations', action: 'activate', description: 'Activate connection' },

    // Tickets module
    { code: 'tickets.ticket.list', module: 'tickets', action: 'list', description: 'List tickets' },
    { code: 'tickets.ticket.view', module: 'tickets', action: 'view', description: 'View ticket' },
    { code: 'tickets.ticket.create', module: 'tickets', action: 'create', description: 'Create ticket' },
    { code: 'tickets.ticket.assign', module: 'tickets', action: 'assign', description: 'Assign ticket' },
    { code: 'tickets.ticket.update', module: 'tickets', action: 'update', description: 'Update ticket' },

    // Dashboards module
    { code: 'dashboards.corporate.view', module: 'dashboards', action: 'corporate_view', description: 'View corporate dashboard' },
    { code: 'dashboards.barangay.view', module: 'dashboards', action: 'barangay_view', description: 'View barangay dashboard' },
    { code: 'dashboards.network.view', module: 'dashboards', action: 'network_view', description: 'View network dashboard' },

    // Billing stub (needed for subscriber ledger endpoint)
    { code: 'billing.invoice.view', module: 'billing', action: 'view', description: 'View invoice/ledger' },

    // ========== Phase 2 Permissions ==========
    { code: 'billing.cycle.list', module: 'billing', action: 'cycle_list', description: 'List billing cycles' },
    { code: 'billing.cycle.manage', module: 'billing', action: 'cycle_manage', description: 'Generate invoices for cycle' },
    { code: 'billing.invoice.list', module: 'billing', action: 'invoice_list', description: 'List invoices' },
    { code: 'billing.invoice.void', module: 'billing', action: 'invoice_void', description: 'Void invoice' },
    { code: 'billing.invoice.adjust', module: 'billing', action: 'invoice_adjust', description: 'Adjust invoice' },
    { code: 'billing.payment.list', module: 'billing', action: 'payment_list', description: 'List payments' },
    { code: 'billing.payment.post', module: 'billing', action: 'payment_post', description: 'Post payment' },
    { code: 'billing.payment.reverse', module: 'billing', action: 'payment_reverse', description: 'Reverse payment' },
    { code: 'billing.suspension.view', module: 'billing', action: 'suspension_view', description: 'View suspension queue' },
    { code: 'billing.suspension.override', module: 'billing', action: 'suspension_override', description: 'Manual suspension override' },
    { code: 'dashboards.finance.view', module: 'dashboards', action: 'finance_view', description: 'View finance dashboard' },

    // ========== Phase 3 Permissions ==========
    { code: 'settlements.settlement.list', module: 'settlements', action: 'list', description: 'List settlements' },
    { code: 'settlements.settlement.view', module: 'settlements', action: 'view', description: 'View settlement detail' },
    { code: 'settlements.settlement.calculate', module: 'settlements', action: 'calculate', description: 'Create and calculate settlement' },
    { code: 'settlements.settlement.submit', module: 'settlements', action: 'submit', description: 'Submit settlement for review' },
    { code: 'settlements.settlement.approve', module: 'settlements', action: 'approve', description: 'Approve settlement' },
    { code: 'settlements.settlement.disburse', module: 'settlements', action: 'disburse', description: 'Mark settlement disbursed' },
    { code: 'settlements.settlement.lock', module: 'settlements', action: 'lock', description: 'Lock settlement period' },
    { code: 'settlements.statement.view', module: 'settlements', action: 'statement_view', description: 'View partner statement' },

    // ========== Phase 4 Permissions ==========
    { code: 'reports.report.view', module: 'reports', action: 'view', description: 'View revenue reports' },
    { code: 'maps.topology.view', module: 'maps', action: 'topology_view', description: 'View network topology map' },
    { code: 'maps.coverage.view', module: 'maps', action: 'coverage_view', description: 'View coverage heatmap' },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const perm of permissionDefs) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions[p.code] = p.id;
  }
  console.log(`  ✅ ${permissionDefs.length} permissions seeded`);

  // ========================================================================
  // 3. Role-Permission Mappings
  // ========================================================================
  const allPermCodes = permissionDefs.map((p) => p.code);

  const rolePermissions: Record<string, string[]> = {
    'Super Admin': allPermCodes, // All permissions
    'Corporate Admin': allPermCodes.filter((c) => c !== 'settings.system.manage'),
    'Operations Manager': [
      'users.user.list', 'users.user.view',
      'barangays.barangay.list', 'barangays.barangay.view', 'barangays.zone.list',
      'partners.partner.list', 'partners.partner.view',
      'agreements.agreement.list', 'agreements.agreement.view',
      'plans.plan.list', 'plans.plan.view',
      'audit.log.list',
    ],
    'Barangay Manager': [
      'barangays.barangay.view', 'barangays.zone.list',
      'partners.partner.list',
      'agreements.agreement.list', 'agreements.agreement.view',
      'plans.plan.list', 'plans.plan.view',
    ],
    'JV Partner Viewer': [
      'agreements.agreement.list', 'agreements.agreement.view',
      'partners.partner.view',
    ],
    'Finance Officer': [
      'plans.plan.list', 'plans.plan.view',
      'agreements.agreement.list', 'agreements.agreement.view',
      'barangays.barangay.list', 'barangays.barangay.view',
      'partners.partner.list', 'partners.partner.view',
      'audit.log.list',
    ],
    'Collection Officer': [
      'plans.plan.list', 'plans.plan.view',
      'barangays.barangay.list',
    ],
    'Network Engineer': [
      'barangays.barangay.list', 'barangays.barangay.view', 'barangays.zone.list',
    ],
    'Field Technician': [
      'barangays.barangay.list',
    ],
    'Customer Service': [
      'plans.plan.list', 'plans.plan.view',
      'barangays.barangay.list',
    ],
    'Auditor': [
      'users.user.list', 'users.user.view', 'users.role.list',
      'barangays.barangay.list', 'barangays.barangay.view', 'barangays.zone.list',
      'partners.partner.list', 'partners.partner.view',
      'agreements.agreement.list', 'agreements.agreement.view',
      'plans.plan.list', 'plans.plan.view',
      'audit.log.list',
    ],
    'Read-only Executive': [
      'barangays.barangay.list', 'barangays.barangay.view',
      'partners.partner.list', 'partners.partner.view',
      'agreements.agreement.list', 'agreements.agreement.view',
      'plans.plan.list', 'plans.plan.view',
      'audit.log.list',
    ],
  };

  for (const [roleName, permCodes] of Object.entries(rolePermissions)) {
    const roleId = createdRoles[roleName];
    if (!roleId) continue;

    // Clear existing
    await prisma.rolePermission.deleteMany({ where: { role_id: roleId } });

    const mappings = permCodes
      .filter((code) => createdPermissions[code])
      .map((code) => ({
        role_id: roleId,
        permission_id: createdPermissions[code],
      }));

    if (mappings.length > 0) {
      await prisma.rolePermission.createMany({ data: mappings, skipDuplicates: true });
    }
    console.log(`  ✅ ${roleName}: ${mappings.length} permissions assigned`);
  }

  // ========================================================================
  // 4. Default Super Admin User
  // ========================================================================
  const adminEmail = 'admin@fiberops.ph';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('FiberOps2026!', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password_hash: passwordHash,
        full_name: 'System Administrator',
        status: 'ACTIVE',
      },
    });

    // Assign Super Admin role
    await prisma.userRole.create({
      data: {
        user_id: admin.id,
        role_id: createdRoles['Super Admin'],
      },
    });

    console.log(`  ✅ Default admin: ${adminEmail} / FiberOps2026!`);
  } else {
    console.log(`  ⏭️  Admin user already exists: ${adminEmail}`);
  }

  // ========================================================================
  // 5. System Settings Defaults
  // ========================================================================
  const defaultSettings: Record<string, string> = {
    'system.name': 'FiberOps PH',
    'system.timezone': 'Asia/Manila',
    'billing.grace_period_days': '7',
    'billing.penalty_percentage': '5.00',
    'billing.auto_suspend_days': '30',
    'installation.sla_days': '7',
    'ticket.sla_hours': '24',
    'settlement.frequency': 'MONTHLY',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`  ✅ ${Object.keys(defaultSettings).length} system settings seeded`);

  // ========================================================================
  // 6. Network Asset Types (Phase 1)
  // ========================================================================
  const assetTypes = [
    { name: 'OLT', hierarchy_level: 1, description: 'Optical Line Terminal' },
    { name: 'PON_PORT', hierarchy_level: 2, description: 'Passive Optical Network Port' },
    { name: 'SPLITTER', hierarchy_level: 3, description: 'Optical Splitter' },
    { name: 'DISTRIBUTION_BOX', hierarchy_level: 4, description: 'Fiber Distribution Box' },
    { name: 'ONT', hierarchy_level: 5, description: 'Optical Network Terminal' },
    { name: 'FIBER_SEGMENT', hierarchy_level: 0, description: 'Fiber Cable Segment' },
  ];

  for (const at of assetTypes) {
    await prisma.networkAssetType.upsert({
      where: { name: at.name },
      update: {},
      create: at,
    });
  }
  console.log(`  ✅ ${assetTypes.length} network asset types seeded`);

  // ========================================================================
  // 7. Test Subscriber for Phase 1.5 Portal
  // ========================================================================
  // First, ensure we have a test barangay
  const testBarangay = await prisma.barangay.upsert({
    where: { name: 'Test Barangay for Portal' },
    update: {},
    create: {
      name: 'Test Barangay for Portal',
      municipality: 'Cebu City',
      province: 'Cebu',
      status: 'ACTIVE'
    }
  });

  // Then ensure a standard plan
  const testPlan = await prisma.servicePlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000'}, // Hacky upsert by looking for missing ID or name
    update: {},
    create: {
      name: 'Fiber Express 100Mbps',
      speed_mbps: 100,
      monthly_fee: 1499.00,
      status: 'ACTIVE'
    }
  });

  const testSubscriberAccount = 'ACC-2026-TEST';
  const existingSubscriber = await prisma.subscriber.findUnique({ where: { account_number: testSubscriberAccount } });

  if (!existingSubscriber) {
    const subscriberPasswordHash = await bcrypt.hash('SubscriberPass123!', 10);
    const sub = await prisma.subscriber.create({
      data: {
        account_number: testSubscriberAccount,
        full_name: 'Juan Dela Cruz',
        status: 'ACTIVE',
        barangay_id: testBarangay.id,
        password_hash: subscriberPasswordHash,
      }
    });

    // Create active subscription
    await prisma.subscription.create({
      data: {
        subscriber_id: sub.id,
        plan_id: testPlan.id,
        start_date: new Date(),
        status: 'ACTIVE'
      }
    });
    console.log(`  ✅ Test subscriber seeded: Account No: ${testSubscriberAccount} / Password: SubscriberPass123!`);
  } else {
    // If it exists but was created before Phase 1.5, make sure it has the password
    if (!existingSubscriber.password_hash) {
      const subscriberPasswordHash = await bcrypt.hash('SubscriberPass123!', 10);
      await prisma.subscriber.update({
        where: { id: existingSubscriber.id },
        data: { password_hash: subscriberPasswordHash }
      });
      console.log(`  ✅ Updated existing test subscriber with Phase 1.5 portal password.`);
    }
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
