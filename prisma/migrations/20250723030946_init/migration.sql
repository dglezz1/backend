-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "socialMedia" TEXT,
    "guests" INTEGER NOT NULL,
    "designChanges" TEXT,
    "cakeType" TEXT NOT NULL,
    "threeMilkFlavor" TEXT,
    "breadFlavor" TEXT,
    "fillingFlavor" TEXT,
    "premiumCake" TEXT,
    "allergies" BOOLEAN NOT NULL,
    "allergyDescription" TEXT,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryTime" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "homeDeliveryAddress" TEXT,
    "agreement" BOOLEAN NOT NULL,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
