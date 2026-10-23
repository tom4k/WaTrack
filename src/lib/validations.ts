import { z } from "zod";

// Date regex YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const initialSetupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

export const consumerSchema = z.object({
  consumerNumber: z.string().min(10, "Consumer number is required (usually 13 digits)"),
  consumerId: z.string().optional().nullable(),
  name: z.string().min(2, "Consumer name is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  sectionName: z.string().min(2, "Section name is required (e.g. Pala Section-5624)"),
  sectionPhone: z.string().optional().nullable(),
  tariff: z.string().default("LT-1 Dom"),
  purpose: z.string().default("Domestic"),
  category: z.string().default("DOMESTIC"),
  connectedLoad: z.string().default("10 kW"),
  phase: z.string().default("3 Phase"),
  postNumber: z.string().optional().nullable(),
  transformer: z.string().optional().nullable(),
  meterSerialNumber: z.string().optional().nullable(),
  meterStatus: z.string().default("Working"),
  multiplyingFactor: z.union([z.number(), z.string()]).default("1.00"),
  securityDeposit: z.union([z.number(), z.string()]).default("0.00"),
  isDefault: z.boolean().default(true),
});

export const billSchema = z.object({
  consumerId: z.string().min(1, "Please select a KSEB consumer"),
  billNumber: z.string().min(1, "Bill number is required"),
  billArea: z.string().optional().nullable(),
  billDate: z.string().regex(dateRegex, "Bill date must be in YYYY-MM-DD format"),
  dueDate: z.string().regex(dateRegex, "Due date must be in YYYY-MM-DD format"),
  disconnectionDate: z.string().regex(dateRegex, "Disconnection date must be in YYYY-MM-DD format").optional().nullable(),
  readingTime: z.string().optional().nullable(),
  previousReadingDate: z.string().regex(dateRegex, "Previous reading date must be YYYY-MM-DD"),
  currentReadingDate: z.string().regex(dateRegex, "Current reading date must be YYYY-MM-DD"),
  billingCycleDays: z.number().int().positive().default(60),
  isBiMonthly: z.boolean().default(true),

  // TOD Meter Readings
  prevReadingNormal: z.union([z.number(), z.string()]).optional().nullable(),
  currReadingNormal: z.union([z.number(), z.string()]).optional().nullable(),
  consumedUnitsNormal: z.union([z.number(), z.string()]).optional().nullable(),

  prevReadingOffPeak: z.union([z.number(), z.string()]).optional().nullable(),
  currReadingOffPeak: z.union([z.number(), z.string()]).optional().nullable(),
  consumedUnitsOffPeak: z.union([z.number(), z.string()]).optional().nullable(),

  prevReadingPeak: z.union([z.number(), z.string()]).optional().nullable(),
  currReadingPeak: z.union([z.number(), z.string()]).optional().nullable(),
  consumedUnitsPeak: z.union([z.number(), z.string()]).optional().nullable(),

  totalUnits: z.union([z.number(), z.string()]),

  // Charges
  energyCharge: z.union([z.number(), z.string()]).default("0.00"),
  duty: z.union([z.number(), z.string()]).default("0.00"),
  fuelSurcharge: z.union([z.number(), z.string()]).default("0.00"),
  fixedCharge: z.union([z.number(), z.string()]).default("0.00"),
  meterRent: z.union([z.number(), z.string()]).default("0.00"),
  roundOff: z.union([z.number(), z.string()]).default("0.00"),
  arrears: z.union([z.number(), z.string()]).default("0.00"),
  totalAmount: z.union([z.number(), z.string()]),
  payableAmount: z.union([z.number(), z.string()]),

  remarks: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  billId: z.string().min(1, "Bill ID is required"),
  paymentDate: z.string().regex(dateRegex, "Payment date must be YYYY-MM-DD"),
  amount: z.union([z.number(), z.string()]),
  paymentMethod: z.enum([
    "KSEB Online Portal",
    "UPI",
    "Net Banking",
    "Cash Counter",
    "Credit/Debit Card",
    "Other",
  ]),
  transactionReference: z.string().optional().nullable(),
  receiptNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const appSettingsSchema = z.object({
  householdName: z.string().min(2, "Household name is required"),
  currency: z.string().default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
  dueReminderDays: z.number().int().min(1).max(30).default(5),
  geminiApiKey: z.string().optional().nullable(),
});

export function getZodErrorMessage(error: any): string {
  if (!error) return "Validation failed";
  if (Array.isArray(error.issues) && error.issues.length > 0) {
    return error.issues[0].message;
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message;
  }
  return error.message || "Validation failed";
}

