CREATE TYPE "public"."type_provider" AS ENUM('local', 'google', 'apple', 'twitter');--> statement-breakpoint
CREATE TABLE "providers" (
	"provider_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "type_provider" NOT NULL,
	"provider_user_id" text,
	"hash_password" text,
	"is_email_verified" boolean DEFAULT false,
	"created_at" timestamp (0) with time zone DEFAULT now(),
	CONSTRAINT "pk_providers_provider_id" PRIMARY KEY("provider_id"),
	CONSTRAINT "uq_provider_per_account" UNIQUE("type","provider_user_id"),
	CONSTRAINT "uq_user_local_provider" UNIQUE("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"created_at" timestamp (0) with time zone DEFAULT now(),
	"updated_at" timestamp (0) with time zone DEFAULT now(),
	CONSTRAINT "pk_users_user_id" PRIMARY KEY("user_id"),
	CONSTRAINT "uq_users_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"user_agent" text,
	"ip_address" "inet",
	"is_revoked" boolean DEFAULT false,
	"created_at" timestamp (0) with time zone DEFAULT now(),
	"revoked_at" timestamp (0) with time zone,
	"last_used_at" timestamp (0) with time zone DEFAULT NULL,
	CONSTRAINT "pk_sessions_session_id" PRIMARY KEY("session_id")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"token_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp (0) with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"revoked_at" timestamp (0) with time zone,
	"created_at" timestamp (0) with time zone DEFAULT now(),
	CONSTRAINT "pk_refresh_tokens_token_id" PRIMARY KEY("token_id")
);
--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "fk_providers_user_id_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_provider_id_providers" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("provider_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "fk_refresh_tokens_session_id_sessions" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("session_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_providers_user_id" ON "providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_providers_verified" ON "providers" USING btree ("user_id","is_email_verified");--> statement-breakpoint
CREATE INDEX "idx_users_full_name" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "idx_sessions_provider_id" ON "sessions" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_active" ON "sessions" USING btree ("provider_id","is_revoked") WHERE "sessions"."is_revoked"=false;--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_session_id" ON "tokens" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_active" ON "tokens" USING btree ("session_id","expires_at") WHERE "tokens"."is_revoked"=false;