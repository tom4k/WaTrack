import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import {
  SAMPLE_CONSUMER,
  SAMPLE_BILLS,
  SAMPLE_PAYMENTS,
  DEFAULT_SETTINGS,
  getDefaultOwnerUser,
} from "./seed-data";

export { schema };

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const isPostgres = Boolean(
  dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))
);

// Setup PostgreSQL client if DATABASE_URL/POSTGRES_URL is available
let pgPool: pg.Pool | null = null;
let pgDb: ReturnType<typeof drizzle> | null = null;

if (isPostgres && dbUrl) {
  try {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
    pgDb = drizzle(pgPool, { schema });
  } catch (err) {
    console.warn("Failed to initialize PostgreSQL pool, falling back to local SQLite:", err);
  }
}

// Local SQLite persistence for dev/tests or when DATABASE_URL is not provided
let sqliteDb: DatabaseSync | null = null;

function getSqliteDb(): DatabaseSync {
  if (sqliteDb) return sqliteDb;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "watrack.db");
  sqliteDb = new DatabaseSync(dbPath);

  // Initialize SQLite schema
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'owner' NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consumers (
      id TEXT PRIMARY KEY,
      consumer_number TEXT UNIQUE NOT NULL,
      consumer_id TEXT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      section_name TEXT,
      section_phone TEXT,
      tariff TEXT DEFAULT 'LT-1 Dom' NOT NULL,
      purpose TEXT DEFAULT 'Domestic',
      category TEXT DEFAULT 'DOMESTIC',
      connected_load TEXT DEFAULT '10 kW',
      phase TEXT DEFAULT '3 Phase',
      post_number TEXT,
      transformer TEXT,
      meter_serial_number TEXT,
      meter_status TEXT DEFAULT 'Working',
      multiplying_factor TEXT DEFAULT '1.00',
      security_deposit TEXT DEFAULT '0.00',
      is_default INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      consumer_id TEXT NOT NULL,
      bill_number TEXT NOT NULL,
      bill_area TEXT,
      bill_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      disconnection_date TEXT,
      reading_time TEXT,
      previous_reading_date TEXT NOT NULL,
      current_reading_date TEXT NOT NULL,
      billing_cycle_days INTEGER DEFAULT 60 NOT NULL,
      is_bi_monthly INTEGER DEFAULT 1 NOT NULL,
      prev_reading_normal TEXT,
      curr_reading_normal TEXT,
      consumed_units_normal TEXT,
      prev_reading_off_peak TEXT,
      curr_reading_off_peak TEXT,
      consumed_units_off_peak TEXT,
      prev_reading_peak TEXT,
      curr_reading_peak TEXT,
      consumed_units_peak TEXT,
      total_units TEXT NOT NULL,
      energy_charge TEXT DEFAULT '0.00' NOT NULL,
      duty TEXT DEFAULT '0.00' NOT NULL,
      fuel_surcharge TEXT DEFAULT '0.00' NOT NULL,
      fixed_charge TEXT DEFAULT '0.00' NOT NULL,
      meter_rent TEXT DEFAULT '0.00' NOT NULL,
      round_off TEXT DEFAULT '0.00' NOT NULL,
      arrears TEXT DEFAULT '0.00' NOT NULL,
      total_amount TEXT NOT NULL,
      payable_amount TEXT NOT NULL,
      paid_amount TEXT DEFAULT '0.00' NOT NULL,
      status TEXT DEFAULT 'UNPAID' NOT NULL,
      document_path TEXT,
      document_original_name TEXT,
      document_mime_type TEXT,
      document_size_bytes INTEGER,
      remarks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (consumer_id) REFERENCES consumers (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      amount TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_reference TEXT,
      receipt_number TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      household_name TEXT DEFAULT 'My Household' NOT NULL,
      currency TEXT DEFAULT 'INR' NOT NULL,
      timezone TEXT DEFAULT 'Asia/Kolkata' NOT NULL,
      due_reminder_days INTEGER DEFAULT 5 NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Auto-seed only in non-production if explicitly requested via AUTO_SEED=true
  const shouldAutoSeed =
    process.env.NODE_ENV !== "production" && process.env.AUTO_SEED === "true";

  if (shouldAutoSeed) {
    const userCount =
      (sqliteDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number })?.count ?? 0;
    if (userCount === 0) {
      seedLocalData(sqliteDb);
    }
  }

  return sqliteDb;
}

function seedLocalData(db: DatabaseSync) {
  try {
    const now = new Date().toISOString();
    // Default Owner
    const defaultOwner = {
      id: "user-owner-default",
      email: "owner@watrack.local",
      // bcrypt hash for 'watrack123'
      passwordHash: "$2b$10$Iu4c98umnJLiji9uM/r0vOAWy5Ghj7APCJ0gvNQj7fpOmn4jPr1Km",
      name: "Household Administrator",
      role: "owner",
    };

    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(defaultOwner.id, defaultOwner.email, defaultOwner.passwordHash, defaultOwner.name, defaultOwner.role, now, now);

    // Consumer
    db.prepare(`
      INSERT OR REPLACE INTO consumers (
        id, consumer_number, consumer_id, name, address, phone, section_name, section_phone,
        tariff, purpose, category, connected_load, phase, post_number, transformer,
        meter_serial_number, meter_status, multiplying_factor, security_deposit, is_default,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SAMPLE_CONSUMER.id,
      SAMPLE_CONSUMER.consumerNumber,
      SAMPLE_CONSUMER.consumerId,
      SAMPLE_CONSUMER.name,
      SAMPLE_CONSUMER.address,
      SAMPLE_CONSUMER.phone,
      SAMPLE_CONSUMER.sectionName,
      SAMPLE_CONSUMER.sectionPhone,
      SAMPLE_CONSUMER.tariff,
      SAMPLE_CONSUMER.purpose,
      SAMPLE_CONSUMER.category,
      SAMPLE_CONSUMER.connectedLoad,
      SAMPLE_CONSUMER.phase,
      SAMPLE_CONSUMER.postNumber,
      SAMPLE_CONSUMER.transformer,
      SAMPLE_CONSUMER.meterSerialNumber,
      SAMPLE_CONSUMER.meterStatus,
      SAMPLE_CONSUMER.multiplyingFactor,
      SAMPLE_CONSUMER.securityDeposit,
      SAMPLE_CONSUMER.isDefault ? 1 : 0,
      now,
      now
    );

    // Bills
    for (const b of SAMPLE_BILLS) {
      db.prepare(`
        INSERT OR REPLACE INTO bills (
          id, consumer_id, bill_number, bill_area, bill_date, due_date, disconnection_date,
          reading_time, previous_reading_date, current_reading_date, billing_cycle_days,
          is_bi_monthly, prev_reading_normal, curr_reading_normal, consumed_units_normal,
          prev_reading_off_peak, curr_reading_off_peak, consumed_units_off_peak,
          prev_reading_peak, curr_reading_peak, consumed_units_peak, total_units,
          energy_charge, duty, fuel_surcharge, fixed_charge, meter_rent, round_off,
          arrears, total_amount, payable_amount, paid_amount, status,
          document_path, document_original_name, document_mime_type, document_size_bytes,
          remarks, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        b.id, b.consumerId, b.billNumber, b.billArea, b.billDate, b.dueDate, b.disconnectionDate,
        b.readingTime, b.previousReadingDate, b.currentReadingDate, b.billingCycleDays,
        b.isBiMonthly ? 1 : 0, b.prevReadingNormal, b.currReadingNormal, b.consumedUnitsNormal,
        b.prevReadingOffPeak, b.currReadingOffPeak, b.consumedUnitsOffPeak,
        b.prevReadingPeak, b.currReadingPeak, b.consumedUnitsPeak, b.totalUnits,
        b.energyCharge, b.duty, b.fuelSurcharge, b.fixedCharge, b.meterRent, b.roundOff,
        b.arrears, b.totalAmount, b.payableAmount, b.paidAmount, b.status,
        b.documentPath, b.documentOriginalName, b.documentMimeType, b.documentSizeBytes,
        b.remarks, now, now
      );
    }

    // Payments
    for (const p of SAMPLE_PAYMENTS) {
      db.prepare(`
        INSERT OR REPLACE INTO payments (
          id, bill_id, payment_date, amount, payment_method, transaction_reference, receipt_number, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        p.id, p.billId, p.paymentDate, p.amount, p.paymentMethod, p.transactionReference, p.receiptNumber, p.notes, now
      );
    }

    // Settings
    db.prepare(`
      INSERT OR REPLACE INTO app_settings (
        id, household_name, currency, timezone, due_reminder_days, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      DEFAULT_SETTINGS.id, DEFAULT_SETTINGS.householdName, DEFAULT_SETTINGS.currency,
      DEFAULT_SETTINGS.timezone, DEFAULT_SETTINGS.dueReminderDays, now
    );
  } catch (err) {
    console.error("Error seeding local sqlite data:", err);
  }
}

/**
 * Unified Database Service API
 */
export const dbService = {
  // --- USERS ---
  async getOwner() {
    const sdb = getSqliteDb();
    const row = sdb.prepare("SELECT * FROM users WHERE role = 'owner' LIMIT 1").get() as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async getUserByEmail(email: string) {
    const sdb = getSqliteDb();
    const row = sdb.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").get(email) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async getUserCount() {
    const sdb = getSqliteDb();
    const row = sdb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    return row?.count ?? 0;
  },

  async createOwner(data: { email: string; passwordHash: string; name: string }) {
    const sdb = getSqliteDb();
    const id = "user-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    sdb.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'owner', ?, ?)
    `).run(id, data.email, data.passwordHash, data.name, now, now);
    return this.getOwner();
  },

  async updateOwnerPassword(id: string, newHash: string) {
    const sdb = getSqliteDb();
    const now = new Date().toISOString();
    sdb.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(newHash, now, id);
    return true;
  },

  // --- CONSUMERS ---
  async getConsumers() {
    const sdb = getSqliteDb();
    const rows = sdb.prepare("SELECT * FROM consumers ORDER BY is_default DESC, name ASC").all() as any[];
    return rows.map((r) => ({
      id: r.id,
      consumerNumber: r.consumer_number,
      consumerId: r.consumer_id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      sectionName: r.section_name,
      sectionPhone: r.section_phone,
      tariff: r.tariff,
      purpose: r.purpose,
      category: r.category,
      connectedLoad: r.connected_load,
      phase: r.phase,
      postNumber: r.post_number,
      transformer: r.transformer,
      meterSerialNumber: r.meter_serial_number,
      meterStatus: r.meter_status,
      multiplyingFactor: r.multiplying_factor,
      securityDeposit: r.security_deposit,
      isDefault: Boolean(r.is_default),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getDefaultConsumer() {
    const sdb = getSqliteDb();
    let row = sdb.prepare("SELECT * FROM consumers WHERE is_default = 1 LIMIT 1").get() as any;
    if (!row) {
      row = sdb.prepare("SELECT * FROM consumers LIMIT 1").get() as any;
    }
    if (!row) return null;
    return {
      id: row.id,
      consumerNumber: row.consumer_number,
      consumerId: row.consumer_id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      sectionName: row.section_name,
      sectionPhone: r_safe(row.section_phone),
      tariff: row.tariff,
      purpose: row.purpose,
      category: row.category,
      connectedLoad: row.connected_load,
      phase: row.phase,
      postNumber: row.post_number,
      transformer: row.transformer,
      meterSerialNumber: row.meter_serial_number,
      meterStatus: row.meter_status,
      multiplyingFactor: row.multiplying_factor,
      securityDeposit: row.security_deposit,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async getConsumerById(id: string) {
    const sdb = getSqliteDb();
    const row = sdb.prepare("SELECT * FROM consumers WHERE id = ?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      consumerNumber: row.consumer_number,
      consumerId: row.consumer_id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      sectionName: row.section_name,
      sectionPhone: row.section_phone,
      tariff: row.tariff,
      purpose: row.purpose,
      category: row.category,
      connectedLoad: row.connected_load,
      phase: row.phase,
      postNumber: row.post_number,
      transformer: row.transformer,
      meterSerialNumber: row.meter_serial_number,
      meterStatus: row.meter_status,
      multiplyingFactor: row.multiplying_factor,
      securityDeposit: row.security_deposit,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async createConsumer(data: any) {
    const sdb = getSqliteDb();
    const id = "cons-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    if (data.isDefault) {
      sdb.prepare("UPDATE consumers SET is_default = 0").run();
    }

    sdb.prepare(`
      INSERT INTO consumers (
        id, consumer_number, consumer_id, name, address, phone, section_name, section_phone,
        tariff, purpose, category, connected_load, phase, post_number, transformer,
        meter_serial_number, meter_status, multiplying_factor, security_deposit, is_default,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.consumerNumber, data.consumerId ?? null, data.name, data.address ?? null, data.phone ?? null,
      data.sectionName, data.sectionPhone ?? null, data.tariff ?? "LT-1 Dom", data.purpose ?? "Domestic",
      data.category ?? "DOMESTIC", data.connectedLoad ?? "10 kW", data.phase ?? "3 Phase",
      data.postNumber ?? null, data.transformer ?? null, data.meterSerialNumber ?? null,
      data.meterStatus ?? "Working", String(data.multiplyingFactor ?? "1.00"), String(data.securityDeposit ?? "0.00"),
      data.isDefault ? 1 : 0, now, now
    );
    return this.getConsumerById(id);
  },

  async updateConsumer(id: string, data: any) {
    const sdb = getSqliteDb();
    const now = new Date().toISOString();

    if (data.isDefault) {
      sdb.prepare("UPDATE consumers SET is_default = 0 WHERE id != ?").run(id);
    }

    sdb.prepare(`
      UPDATE consumers SET
        consumer_number = ?, consumer_id = ?, name = ?, address = ?, phone = ?,
        section_name = ?, section_phone = ?, tariff = ?, purpose = ?, category = ?,
        connected_load = ?, phase = ?, post_number = ?, transformer = ?,
        meter_serial_number = ?, meter_status = ?, multiplying_factor = ?,
        security_deposit = ?, is_default = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.consumerNumber, data.consumerId ?? null, data.name, data.address ?? null, data.phone ?? null,
      data.sectionName, data.sectionPhone ?? null, data.tariff ?? "LT-1 Dom", data.purpose ?? "Domestic",
      data.category ?? "DOMESTIC", data.connectedLoad ?? "10 kW", data.phase ?? "3 Phase",
      data.postNumber ?? null, data.transformer ?? null, data.meterSerialNumber ?? null,
      data.meterStatus ?? "Working", String(data.multiplyingFactor ?? "1.00"), String(data.securityDeposit ?? "0.00"),
      data.isDefault ? 1 : 0, now, id
    );
    return this.getConsumerById(id);
  },

  // --- BILLS ---
  async getBills(filters?: { status?: string; year?: string; search?: string; consumerId?: string }) {
    const sdb = getSqliteDb();
    let query = "SELECT b.*, c.name as consumer_name, c.consumer_number FROM bills b LEFT JOIN consumers c ON b.consumer_id = c.id WHERE 1=1";
    const params: any[] = [];

    if (filters?.status && filters.status !== "ALL") {
      query += " AND b.status = ?";
      params.push(filters.status);
    }
    if (filters?.year && filters.year !== "ALL") {
      query += " AND substr(b.bill_date, 1, 4) = ?";
      params.push(filters.year);
    }
    if (filters?.consumerId && filters.consumerId !== "ALL") {
      query += " AND b.consumer_id = ?";
      params.push(filters.consumerId);
    }
    if (filters?.search) {
      query += " AND (b.bill_number LIKE ? OR c.consumer_number LIKE ? OR c.name LIKE ? OR b.remarks LIKE ?)";
      const pattern = `%${filters.search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    query += " ORDER BY b.bill_date DESC";
    const rows = sdb.prepare(query).all(...params) as any[];

    // Recalculate overdue status dynamically
    const today = new Date().toISOString().split("T")[0];
    return rows.map((r) => {
      let status = r.status;
      const payable = parseFloat(r.payable_amount || "0");
      const paid = parseFloat(r.paid_amount || "0");
      if (paid >= payable) {
        status = "PAID";
      } else if (paid > 0) {
        status = "PARTIALLY_PAID";
      } else if (r.due_date < today) {
        status = "OVERDUE";
      } else {
        status = "UNPAID";
      }

      return mapBillRow(r, status);
    });
  },

  async getBillById(id: string) {
    const sdb = getSqliteDb();
    const row = sdb.prepare("SELECT b.*, c.name as consumer_name, c.consumer_number, c.tariff, c.phase, c.connected_load, c.section_name FROM bills b LEFT JOIN consumers c ON b.consumer_id = c.id WHERE b.id = ?").get(id) as any;
    if (!row) return null;
    return mapBillRow(row, row.status);
  },

  async createBill(data: any) {
    const sdb = getSqliteDb();
    const id = "bill-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    const payable = parseFloat(String(data.payableAmount || data.totalAmount || "0"));
    const paid = parseFloat(String(data.paidAmount || "0"));
    const today = new Date().toISOString().split("T")[0];
    let status = "UNPAID";
    if (paid >= payable) status = "PAID";
    else if (paid > 0) status = "PARTIALLY_PAID";
    else if (data.dueDate < today) status = "OVERDUE";

    sdb.prepare(`
      INSERT INTO bills (
        id, consumer_id, bill_number, bill_area, bill_date, due_date, disconnection_date,
        reading_time, previous_reading_date, current_reading_date, billing_cycle_days,
        is_bi_monthly, prev_reading_normal, curr_reading_normal, consumed_units_normal,
        prev_reading_off_peak, curr_reading_off_peak, consumed_units_off_peak,
        prev_reading_peak, curr_reading_peak, consumed_units_peak, total_units,
        energy_charge, duty, fuel_surcharge, fixed_charge, meter_rent, round_off,
        arrears, total_amount, payable_amount, paid_amount, status,
        document_path, document_original_name, document_mime_type, document_size_bytes,
        remarks, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id, data.consumerId, data.billNumber, data.billArea ?? null, data.billDate, data.dueDate,
      data.disconnectionDate ?? null, data.readingTime ?? null, data.previousReadingDate, data.currentReadingDate,
      Number(data.billingCycleDays || 60), data.isBiMonthly ? 1 : 0,
      r_num(data.prevReadingNormal), r_num(data.currReadingNormal), r_num(data.consumedUnitsNormal),
      r_num(data.prevReadingOffPeak), r_num(data.currReadingOffPeak), r_num(data.consumedUnitsOffPeak),
      r_num(data.prevReadingPeak), r_num(data.currReadingPeak), r_num(data.consumedUnitsPeak),
      r_num(data.totalUnits),
      r_num(data.energyCharge, "0.00"), r_num(data.duty, "0.00"), r_num(data.fuelSurcharge, "0.00"),
      r_num(data.fixedCharge, "0.00"), r_num(data.meterRent, "0.00"), r_num(data.roundOff, "0.00"),
      r_num(data.arrears, "0.00"), r_num(data.totalAmount), r_num(data.payableAmount),
      r_num(data.paidAmount, "0.00"), status,
      data.documentPath ?? null, data.documentOriginalName ?? null, data.documentMimeType ?? null, data.documentSizeBytes ? Number(data.documentSizeBytes) : null,
      data.remarks ?? null, now, now
    );

    return this.getBillById(id);
  },

  async updateBill(id: string, data: any) {
    const sdb = getSqliteDb();
    const now = new Date().toISOString();
    const current = await this.getBillById(id);
    if (!current) return null;

    const payable = parseFloat(String(data.payableAmount ?? current.payableAmount));
    const paid = parseFloat(String(data.paidAmount ?? current.paidAmount));
    const dueDate = data.dueDate ?? current.dueDate;
    const today = new Date().toISOString().split("T")[0];
    let status = "UNPAID";
    if (paid >= payable) status = "PAID";
    else if (paid > 0) status = "PARTIALLY_PAID";
    else if (dueDate < today) status = "OVERDUE";

    sdb.prepare(`
      UPDATE bills SET
        consumer_id = ?, bill_number = ?, bill_area = ?, bill_date = ?, due_date = ?,
        disconnection_date = ?, reading_time = ?, previous_reading_date = ?, current_reading_date = ?,
        billing_cycle_days = ?, is_bi_monthly = ?,
        prev_reading_normal = ?, curr_reading_normal = ?, consumed_units_normal = ?,
        prev_reading_off_peak = ?, curr_reading_off_peak = ?, consumed_units_off_peak = ?,
        prev_reading_peak = ?, curr_reading_peak = ?, consumed_units_peak = ?,
        total_units = ?, energy_charge = ?, duty = ?, fuel_surcharge = ?, fixed_charge = ?,
        meter_rent = ?, round_off = ?, arrears = ?, total_amount = ?, payable_amount = ?,
        paid_amount = ?, status = ?,
        document_path = COALESCE(?, document_path),
        document_original_name = COALESCE(?, document_original_name),
        document_mime_type = COALESCE(?, document_mime_type),
        document_size_bytes = COALESCE(?, document_size_bytes),
        remarks = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.consumerId ?? current.consumerId,
      data.billNumber ?? current.billNumber,
      data.billArea ?? current.billArea,
      data.billDate ?? current.billDate,
      data.dueDate ?? current.dueDate,
      data.disconnectionDate ?? current.disconnectionDate,
      data.readingTime ?? current.readingTime,
      data.previousReadingDate ?? current.previousReadingDate,
      data.currentReadingDate ?? current.currentReadingDate,
      Number(data.billingCycleDays ?? current.billingCycleDays),
      (data.isBiMonthly !== undefined ? data.isBiMonthly : current.isBiMonthly) ? 1 : 0,
      r_num(data.prevReadingNormal ?? current.prevReadingNormal),
      r_num(data.currReadingNormal ?? current.currReadingNormal),
      r_num(data.consumedUnitsNormal ?? current.consumedUnitsNormal),
      r_num(data.prevReadingOffPeak ?? current.prevReadingOffPeak),
      r_num(data.currReadingOffPeak ?? current.currReadingOffPeak),
      r_num(data.consumedUnitsOffPeak ?? current.consumedUnitsOffPeak),
      r_num(data.prevReadingPeak ?? current.prevReadingPeak),
      r_num(data.currReadingPeak ?? current.currReadingPeak),
      r_num(data.consumedUnitsPeak ?? current.consumedUnitsPeak),
      r_num(data.totalUnits ?? current.totalUnits),
      r_num(data.energyCharge ?? current.energyCharge, "0.00"),
      r_num(data.duty ?? current.duty, "0.00"),
      r_num(data.fuelSurcharge ?? current.fuelSurcharge, "0.00"),
      r_num(data.fixedCharge ?? current.fixedCharge, "0.00"),
      r_num(data.meterRent ?? current.meterRent, "0.00"),
      r_num(data.roundOff ?? current.roundOff, "0.00"),
      r_num(data.arrears ?? current.arrears, "0.00"),
      r_num(data.totalAmount ?? current.totalAmount),
      r_num(data.payableAmount ?? current.payableAmount),
      r_num(paid, "0.00"),
      status,
      data.documentPath ?? null,
      data.documentOriginalName ?? null,
      data.documentMimeType ?? null,
      data.documentSizeBytes ? Number(data.documentSizeBytes) : null,
      data.remarks ?? current.remarks,
      now,
      id
    );

    return this.getBillById(id);
  },

  async deleteBill(id: string) {
    const sdb = getSqliteDb();
    sdb.prepare("DELETE FROM payments WHERE bill_id = ?").run(id);
    sdb.prepare("DELETE FROM bills WHERE id = ?").run(id);
    return true;
  },

  // --- PAYMENTS ---
  async getPayments(billId?: string) {
    const sdb = getSqliteDb();
    let query = `
      SELECT p.*, b.bill_number, b.bill_date, b.payable_amount, c.name as consumer_name, c.consumer_number
      FROM payments p
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN consumers c ON b.consumer_id = c.id
    `;
    const params: any[] = [];
    if (billId) {
      query += " WHERE p.bill_id = ?";
      params.push(billId);
    }
    query += " ORDER BY p.payment_date DESC, p.created_at DESC";
    const rows = sdb.prepare(query).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      billId: r.bill_id,
      billNumber: r.bill_number,
      billDate: r.bill_date,
      payableAmount: r.payable_amount,
      consumerName: r.consumer_name,
      consumerNumber: r.consumer_number,
      paymentDate: r.payment_date,
      amount: r.amount,
      paymentMethod: r.payment_method,
      transactionReference: r.transaction_reference,
      receiptNumber: r.receipt_number,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  },

  async recordPayment(data: {
    billId: string;
    paymentDate: string;
    amount: string | number;
    paymentMethod: string;
    transactionReference?: string | null;
    receiptNumber?: string | null;
    notes?: string | null;
  }) {
    const sdb = getSqliteDb();
    const id = "pay-" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const amountNum = parseFloat(String(data.amount));

    sdb.prepare(`
      INSERT INTO payments (
        id, bill_id, payment_date, amount, payment_method, transaction_reference, receipt_number, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.billId, data.paymentDate, String(amountNum.toFixed(2)),
      data.paymentMethod, data.transactionReference ?? null, data.receiptNumber ?? null, data.notes ?? null, now
    );

    // Update bill paid amount and status
    const currentPayments = sdb.prepare("SELECT SUM(CAST(amount AS REAL)) as total_paid FROM payments WHERE bill_id = ?").get(data.billId) as any;
    const totalPaid = Number(currentPayments?.total_paid || 0);

    const bill = await this.getBillById(data.billId);
    if (bill) {
      const payable = parseFloat(String(bill.payableAmount));
      const today = new Date().toISOString().split("T")[0];
      let status = "UNPAID";
      if (totalPaid >= payable) {
        status = "PAID";
      } else if (totalPaid > 0) {
        status = "PARTIALLY_PAID";
      } else if (bill.dueDate < today) {
        status = "OVERDUE";
      }

      sdb.prepare("UPDATE bills SET paid_amount = ?, status = ?, updated_at = ? WHERE id = ?").run(
        totalPaid.toFixed(2), status, now, data.billId
      );
    }

    return { id, totalPaid };
  },

  async deletePayment(id: string) {
    const sdb = getSqliteDb();
    const payment = sdb.prepare("SELECT * FROM payments WHERE id = ?").get(id) as any;
    if (!payment) return false;

    sdb.prepare("DELETE FROM payments WHERE id = ?").run(id);

    // Recalculate bill status
    const currentPayments = sdb.prepare("SELECT SUM(CAST(amount AS REAL)) as total_paid FROM payments WHERE bill_id = ?").get(payment.bill_id) as any;
    const totalPaid = Number(currentPayments?.total_paid || 0);

    const bill = await this.getBillById(payment.bill_id);
    if (bill) {
      const payable = parseFloat(String(bill.payableAmount));
      const today = new Date().toISOString().split("T")[0];
      let status = "UNPAID";
      if (totalPaid >= payable) status = "PAID";
      else if (totalPaid > 0) status = "PARTIALLY_PAID";
      else if (bill.dueDate < today) status = "OVERDUE";

      const now = new Date().toISOString();
      sdb.prepare("UPDATE bills SET paid_amount = ?, status = ?, updated_at = ? WHERE id = ?").run(
        totalPaid.toFixed(2), status, now, payment.bill_id
      );
    }
    return true;
  },

  // --- SETTINGS ---
  async getSettings() {
    const sdb = getSqliteDb();
    let row = sdb.prepare("SELECT * FROM app_settings LIMIT 1").get() as any;
    if (!row) {
      const now = new Date().toISOString();
      sdb.prepare(`
        INSERT INTO app_settings (id, household_name, currency, timezone, due_reminder_days, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(DEFAULT_SETTINGS.id, DEFAULT_SETTINGS.householdName, DEFAULT_SETTINGS.currency, DEFAULT_SETTINGS.timezone, DEFAULT_SETTINGS.dueReminderDays, now);
      row = DEFAULT_SETTINGS;
    }
    return {
      id: row.id,
      householdName: row.household_name ?? row.householdName,
      currency: row.currency,
      timezone: row.timezone,
      dueReminderDays: Number(row.due_reminder_days ?? row.dueReminderDays ?? 5),
    };
  },

  async updateSettings(data: { householdName?: string; currency?: string; timezone?: string; dueReminderDays?: number }) {
    const sdb = getSqliteDb();
    const current = await this.getSettings();
    const now = new Date().toISOString();
    sdb.prepare(`
      UPDATE app_settings SET
        household_name = ?, currency = ?, timezone = ?, due_reminder_days = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.householdName ?? current.householdName,
      data.currency ?? current.currency,
      data.timezone ?? current.timezone,
      data.dueReminderDays ?? current.dueReminderDays,
      now,
      current.id
    );
    return this.getSettings();
  },

  // --- SEED OR RESET ---
  async seedSampleData() {
    const sdb = getSqliteDb();
    seedLocalData(sdb);
    return true;
  },
};

// Helpers
function r_safe(v: any) {
  return v === undefined || v === null ? null : v;
}

function r_num(v: any, def = "0.00") {
  if (v === undefined || v === null || v === "") return def;
  const n = parseFloat(String(v));
  return isNaN(n) ? def : n.toFixed(2);
}

function mapBillRow(r: any, dynamicStatus: string) {
  return {
    id: r.id,
    consumerId: r.consumer_id,
    consumerName: r.consumer_name,
    consumerNumber: r.consumer_number,
    tariff: r.tariff,
    phase: r.phase,
    connectedLoad: r.connected_load,
    sectionName: r.section_name,
    billNumber: r.bill_number,
    billArea: r.bill_area,
    billDate: r.bill_date,
    dueDate: r.due_date,
    disconnectionDate: r.disconnection_date,
    readingTime: r.reading_time,
    previousReadingDate: r.previous_reading_date,
    currentReadingDate: r.current_reading_date,
    billingCycleDays: r.billing_cycle_days,
    isBiMonthly: Boolean(r.is_bi_monthly),
    prevReadingNormal: r.prev_reading_normal,
    currReadingNormal: r.curr_reading_normal,
    consumedUnitsNormal: r.consumed_units_normal,
    prevReadingOffPeak: r.prev_reading_off_peak,
    currReadingOffPeak: r.curr_reading_off_peak,
    consumedUnitsOffPeak: r.consumed_units_off_peak,
    prevReadingPeak: r.prev_reading_peak,
    currReadingPeak: r.curr_reading_peak,
    consumedUnitsPeak: r.consumed_units_peak,
    totalUnits: r.total_units,
    energyCharge: r.energy_charge,
    duty: r.duty,
    fuelSurcharge: r.fuel_surcharge,
    fixedCharge: r.fixed_charge,
    meterRent: r.meter_rent,
    roundOff: r.round_off,
    arrears: r.arrears,
    totalAmount: r.total_amount,
    payableAmount: r.payable_amount,
    paidAmount: r.paid_amount,
    status: dynamicStatus,
    documentPath: r.document_path,
    documentOriginalName: r.document_original_name,
    documentMimeType: r.document_mime_type,
    documentSizeBytes: r.document_size_bytes,
    remarks: r.remarks,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
