-- CreateTable
CREATE TABLE "public"."urls" (
    "id" SERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "long_url" TEXT NOT NULL,
    "user_id" INTEGER,
    "custom_alias" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" SERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "click_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "user_agent" VARCHAR(255),
    "geo_location" VARCHAR(100),

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "public"."urls"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "urls_custom_alias_key" ON "public"."urls"("custom_alias");

-- CreateIndex
CREATE INDEX "analytics_short_code_idx" ON "public"."analytics"("short_code");

-- CreateIndex
CREATE INDEX "analytics_click_time_idx" ON "public"."analytics"("click_time");

-- AddForeignKey
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_short_code_fkey" FOREIGN KEY ("short_code") REFERENCES "public"."urls"("short_code") ON DELETE RESTRICT ON UPDATE CASCADE;
