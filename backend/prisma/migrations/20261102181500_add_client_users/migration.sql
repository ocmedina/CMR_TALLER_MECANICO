-- Add client accounts without changing existing client records.
ALTER TYPE "Role" ADD VALUE 'CLIENT';

ALTER TABLE "users"
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "clientId" TEXT;

CREATE UNIQUE INDEX "users_clientId_key" ON "users"("clientId");

ALTER TABLE "users"
  ADD CONSTRAINT "users_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
