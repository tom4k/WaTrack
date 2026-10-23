CREATE TABLE "app_settings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"household_name" varchar(255) DEFAULT 'My Household' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"due_reminder_days" integer DEFAULT 5 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"consumer_id" varchar(36) NOT NULL,
	"bill_number" varchar(100) NOT NULL,
	"bill_area" varchar(100),
	"bill_date" varchar(10) NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"disconnection_date" varchar(10),
	"reading_time" varchar(50),
	"previous_reading_date" varchar(10) NOT NULL,
	"current_reading_date" varchar(10) NOT NULL,
	"billing_cycle_days" integer DEFAULT 60 NOT NULL,
	"is_bi_monthly" boolean DEFAULT true NOT NULL,
	"prev_reading_normal" numeric(10, 2),
	"curr_reading_normal" numeric(10, 2),
	"consumed_units_normal" numeric(10, 2),
	"prev_reading_off_peak" numeric(10, 2),
	"curr_reading_off_peak" numeric(10, 2),
	"consumed_units_off_peak" numeric(10, 2),
	"prev_reading_peak" numeric(10, 2),
	"curr_reading_peak" numeric(10, 2),
	"consumed_units_peak" numeric(10, 2),
	"total_units" numeric(10, 2) NOT NULL,
	"energy_charge" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"duty" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"fuel_surcharge" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"fixed_charge" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"meter_rent" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"round_off" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"arrears" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"payable_amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"status" varchar(30) DEFAULT 'UNPAID' NOT NULL,
	"document_path" text,
	"document_original_name" text,
	"document_mime_type" varchar(100),
	"document_size_bytes" integer,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"consumer_number" varchar(50) NOT NULL,
	"consumer_id" varchar(50),
	"name" varchar(255) NOT NULL,
	"address" text,
	"phone" varchar(50),
	"section_name" varchar(100),
	"section_phone" varchar(50),
	"tariff" varchar(50) DEFAULT 'LT-1 Dom' NOT NULL,
	"purpose" varchar(100) DEFAULT 'Domestic',
	"category" varchar(100) DEFAULT 'DOMESTIC',
	"connected_load" varchar(50) DEFAULT '10 kW',
	"phase" varchar(20) DEFAULT '3 Phase',
	"post_number" varchar(50),
	"transformer" varchar(100),
	"meter_serial_number" varchar(100),
	"meter_status" varchar(50) DEFAULT 'Working',
	"multiplying_factor" numeric(5, 2) DEFAULT '1.00',
	"security_deposit" numeric(12, 2) DEFAULT '0.00',
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consumers_consumer_number_unique" UNIQUE("consumer_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"bill_id" varchar(36) NOT NULL,
	"payment_date" varchar(10) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"transaction_reference" varchar(100),
	"receipt_number" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_consumer_id_consumers_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "public"."consumers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;