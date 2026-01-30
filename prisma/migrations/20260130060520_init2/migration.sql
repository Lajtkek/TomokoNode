-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReaction" (
    "id" BIGSERIAL NOT NULL,
    "emojiName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idReactor" BIGINT NOT NULL,
    "idReactTarget" BIGINT NOT NULL,
    "idReactionCounter" BIGINT NOT NULL,

    CONSTRAINT "UserReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReactionCount" (
    "id" BIGSERIAL NOT NULL,
    "idUser" BIGINT NOT NULL,
    "emojiName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserReactionCount_pkey" PRIMARY KEY ("id")
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
