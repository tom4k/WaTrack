import { pgTable, varchar, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const consumers = pgTable("consumers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  consumerNumber: varchar("consumer_number", { length: 50 }).notNull().unique(), // 13-digit e.g., 1156241018150
  consumerId: varchar("consumer_id", { length: 50 }), // e.g. 10975757
  name: varchar("name", { length: 255 }).notNull(), // e.g. KURIAKOSE ALEXANDER
  address: text("address"), // e.g. KAYATHINKARA, KAROOR, PO, KOTTAYAM
  phone: varchar("phone", { length: 50 }),
  sectionName: varchar("section_name", { length: 100 }), // e.g. Pala Section-5624
  sectionPhone: varchar("section_phone", { length: 50 }), // e.g. 0482-2212477
  tariff: varchar("tariff", { length: 50 }).notNull().default("LT-1 Dom"),
  purpose: varchar("purpose", { length: 100 }).default("Domestic"),
  category: varchar("category", { length: 100 }).default("DOMESTIC"),
  connectedLoad: varchar("connected_load", { length: 50 }).default("10 kW"),
  phase: varchar("phase", { length: 20 }).default("3 Phase"),
  postNumber: varchar("post_number", { length: 50 }), // e.g. PR-124/4/4
  transformer: varchar("transformer", { length: 100 }), // e.g. POOTHAKUZHY
  meterSerialNumber: varchar("meter_serial_number", { length: 100 }), // e.g. HEP7198657
  meterStatus: varchar("meter_status", { length: 50 }).default("Working"),
  multiplyingFactor: numeric("multiplying_factor", { precision: 5, scale: 2 }).default("1.00"),
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }).default("0.00"),
  isDefault: boolean("is_default").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: varchar("id", { length: 36 }).primaryKey(),
  consumerId: varchar("consumer_id", { length: 36 })
    .notNull()
    .references(() => consumers.id, { onDelete: "cascade" }),
  billNumber: varchar("bill_number", { length: 100 }).notNull(), // e.g. 5624261012132
  billArea: varchar("bill_area", { length: 100 }), // e.g. B02/15/114
  billDate: varchar("bill_date", { length: 10 }).notNull(), // YYYY-MM-DD
  dueDate: varchar("due_date", { length: 10 }).notNull(), // YYYY-MM-DD
  disconnectionDate: varchar("disconnection_date", { length: 10 }), // YYYY-MM-DD
  readingTime: varchar("reading_time", { length: 50 }), // e.g. 18/10/2026 11:29:59 AM
  previousReadingDate: varchar("previous_reading_date", { length: 10 }).notNull(), // YYYY-MM-DD
  currentReadingDate: varchar("current_reading_date", { length: 10 }).notNull(), // YYYY-MM-DD
  billingCycleDays: integer("billing_cycle_days").default(60).notNull(), // typically 60 for bi-monthly
  isBiMonthly: boolean("is_bi_monthly").default(true).notNull(),

  // Time-Of-Day (TOD) Readings & Consumption
  prevReadingNormal: numeric("prev_reading_normal", { precision: 10, scale: 2 }),
  currReadingNormal: numeric("curr_reading_normal", { precision: 10, scale: 2 }),
  usedUnitsNormal: numeric("used_units_normal", { precision: 10, scale: 2 }),
  consumedUnitsNormal: numeric("consumed_units_normal", { precision: 10, scale: 2 }),

  prevReadingOffPeak: numeric("prev_reading_off_peak", { precision: 10, scale: 2 }),
  currReadingOffPeak: numeric("curr_reading_off_peak", { precision: 10, scale: 2 }),
  usedUnitsOffPeak: numeric("used_units_off_peak", { precision: 10, scale: 2 }),
  consumedUnitsOffPeak: numeric("consumed_units_off_peak", { precision: 10, scale: 2 }),

  prevReadingPeak: numeric("prev_reading_peak", { precision: 10, scale: 2 }),
  currReadingPeak: numeric("curr_reading_peak", { precision: 10, scale: 2 }),
  usedUnitsPeak: numeric("used_units_peak", { precision: 10, scale: 2 }),
  consumedUnitsPeak: numeric("consumed_units_peak", { precision: 10, scale: 2 }),

  totalUsedUnits: numeric("total_used_units", { precision: 10, scale: 2 }),
  totalUnits: numeric("total_units", { precision: 10, scale: 2 }).notNull(),

  // Charge Particulars (Stored precisely in INR)
  energyCharge: numeric("energy_charge", { precision: 12, scale: 2 }).notNull().default("0.00"),
  duty: numeric("duty", { precision: 12, scale: 2 }).notNull().default("0.00"), // Electricity Duty (10%)
  fuelSurcharge: numeric("fuel_surcharge", { precision: 12, scale: 2 }).notNull().default("0.00"),
  fixedCharge: numeric("fixed_charge", { precision: 12, scale: 2 }).notNull().default("0.00"),
  meterRent: numeric("meter_rent", { precision: 12, scale: 2 }).notNull().default("0.00"),
  roundOff: numeric("round_off", { precision: 12, scale: 2 }).notNull().default("0.00"),
  arrears: numeric("arrears", { precision: 12, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  payableAmount: numeric("payable_amount", { precision: 12, scale: 2 }).notNull(),

  // Payment Tracking
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 30 }).notNull().default("UNPAID"), // UNPAID, PARTIALLY_PAID, PAID, OVERDUE

  // PDF / Document Attachment
  documentPath: text("document_path"),
  documentOriginalName: text("document_original_name"),
  documentMimeType: varchar("document_mime_type", { length: 100 }),
  documentSizeBytes: integer("document_size_bytes"),

  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  billId: varchar("bill_id", { length: 36 })
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  paymentDate: varchar("payment_date", { length: 10 }).notNull(), // YYYY-MM-DD
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // KSEB Online Portal, UPI, Net Banking, Cash, Card, Other
  transactionReference: varchar("transaction_reference", { length: 100 }),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  householdName: varchar("household_name", { length: 255 }).notNull().default("My Household"),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),
  dueReminderDays: integer("due_reminder_days").notNull().default(5),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const consumersRelations = relations(consumers, ({ many }) => ({
  bills: many(bills),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  consumer: one(consumers, {
    fields: [bills.consumerId],
    references: [consumers.id],
  }),
  payments: many(payments),
}));

export const documents = pgTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull().unique(),
  originalName: text("original_name"),
  mimeType: varchar("mime_type", { length: 100 }),
  sizeBytes: integer("size_bytes"),
  dataBase64: text("data_base64").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Consumer = typeof consumers.$inferSelect;
export type NewConsumer = typeof consumers.$inferInsert;
export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
