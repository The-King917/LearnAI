-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topics" JSONB NOT NULL DEFAULT '[]',
    "statement" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "choices" JSONB,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "validationScore" DOUBLE PRECISION,
    "validationNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "testId" TEXT,
    "answer" TEXT,
    "correct" BOOLEAN,
    "timeSecs" INTEGER,
    "debriefed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "timed" BOOLEAN NOT NULL DEFAULT true,
    "timeLimitSecs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "topicBreakdown" JSONB,

    CONSTRAINT "MockTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestProblem" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "MockTestProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "concepts" JSONB NOT NULL DEFAULT '{}',
    "summaries" JSONB NOT NULL DEFAULT '[]',
    "overallLevel" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "competitionDate" TIMESTAMP(3),
    "days" JSONB NOT NULL DEFAULT '[]',
    "adjustments" JSONB NOT NULL DEFAULT '[]',
    "weeklyReports" JSONB NOT NULL DEFAULT '[]',
    "currentDay" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayVersion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "feedback" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EssayVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Problem_competition_status_difficulty_idx" ON "Problem"("competition", "status", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemAttempt_userId_problemId_key" ON "ProblemAttempt"("userId", "problemId");

-- CreateIndex
CREATE INDEX "ProblemAttempt_userId_testId_idx" ON "ProblemAttempt"("userId", "testId");

-- CreateIndex
CREATE INDEX "MockTest_userId_competition_idx" ON "MockTest"("userId", "competition");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestProblem_testId_position_key" ON "MockTestProblem"("testId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StudentModel_userId_subjectId_key" ON "StudentModel"("userId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_userId_subjectId_key" ON "StudyPlan"("userId", "subjectId");

-- CreateIndex
CREATE INDEX "EssayVersion_userId_school_idx" ON "EssayVersion"("userId", "school");

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTest" ADD CONSTRAINT "MockTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestProblem" ADD CONSTRAINT "MockTestProblem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestProblem" ADD CONSTRAINT "MockTestProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModel" ADD CONSTRAINT "StudentModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayVersion" ADD CONSTRAINT "EssayVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
