-- CreateTable
CREATE TABLE "GoogleCredentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER,
    "createdAt" INTEGER NOT NULL,

    CONSTRAINT "GoogleCredentials_pkey" PRIMARY KEY ("id")
);
