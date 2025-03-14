-- CreateTable
CREATE TABLE "CipherMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CipherMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CipherMessage" ADD CONSTRAINT "CipherMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
