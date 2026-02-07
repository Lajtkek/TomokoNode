-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "helperScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReaction" (
    "id" BIGSERIAL NOT NULL,
    "emojiName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idReactor" TEXT NOT NULL,
    "idReactTarget" TEXT NOT NULL,
    "idReactionCounter" BIGINT NOT NULL,

    CONSTRAINT "UserReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReactionCount" (
    "id" BIGSERIAL NOT NULL,
    "idUser" TEXT NOT NULL,
    "emojiName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserReactionCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" BIGSERIAL NOT NULL,
    "idOwner" TEXT NOT NULL,
    "idChannel" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderRecipient" (
    "reminderId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReminderRecipient_pkey" PRIMARY KEY ("reminderId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserReaction_idReactor_idReactTarget_emojiName_key" ON "UserReaction"("idReactor", "idReactTarget", "emojiName");

-- CreateIndex
CREATE UNIQUE INDEX "UserReactionCount_idUser_emojiName_key" ON "UserReactionCount"("idUser", "emojiName");

-- AddForeignKey
ALTER TABLE "UserReaction" ADD CONSTRAINT "UserReaction_idReactor_fkey" FOREIGN KEY ("idReactor") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReaction" ADD CONSTRAINT "UserReaction_idReactTarget_fkey" FOREIGN KEY ("idReactTarget") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReaction" ADD CONSTRAINT "UserReaction_idReactionCounter_fkey" FOREIGN KEY ("idReactionCounter") REFERENCES "UserReactionCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReactionCount" ADD CONSTRAINT "UserReactionCount_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_idOwner_fkey" FOREIGN KEY ("idOwner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRecipient" ADD CONSTRAINT "ReminderRecipient_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRecipient" ADD CONSTRAINT "ReminderRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
