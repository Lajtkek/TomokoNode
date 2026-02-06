-- CreateTable
CREATE TABLE "Reminder" (
    "id" BIGSERIAL NOT NULL,
    "idOwner" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderRecipient" (
    "reminderId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReminderRecipient_pkey" PRIMARY KEY ("reminderId","userId")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_idOwner_fkey" FOREIGN KEY ("idOwner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRecipient" ADD CONSTRAINT "ReminderRecipient_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRecipient" ADD CONSTRAINT "ReminderRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
