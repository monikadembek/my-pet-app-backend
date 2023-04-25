-- CreateTable
CREATE TABLE "RefreshTokenStorage" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "RefreshTokenStorage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenStorage_token_key" ON "RefreshTokenStorage"("token");
