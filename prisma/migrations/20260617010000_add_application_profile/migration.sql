-- CreateTable
CREATE TABLE "ApplicationProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION,
    "gpaScale" TEXT,
    "satScore" INTEGER,
    "actScore" INTEGER,
    "intendedMajor" TEXT,
    "courseRigor" TEXT,
    "extracurriculars" TEXT,
    "awards" TEXT,
    "essay" TEXT,
    "demographics" TEXT,
    "schoolProfile" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationProfile_userId_key" ON "ApplicationProfile"("userId");

-- AddForeignKey
ALTER TABLE "ApplicationProfile" ADD CONSTRAINT "ApplicationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
