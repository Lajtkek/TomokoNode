import { Client, GatewayIntentBits, Events, type PartialUser, type User } from "discord.js";
import { PrismaClient } from "../generated/prisma/index.js";

const SCORE_FOR_REACT = 1;
const SCORE_FOR_MESSAGE = 1;

export function addReactionCountModule(client: Client, prisma: PrismaClient){

    async function addScore(idUser: number, score: number){
        await prisma.user.update({
            where: {
                id: idUser,
            },
            data: {
                helperScore: {
                    increment: score
                }
            }
        })
    }

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        const emojiName = reaction.emoji.name?.toLocaleLowerCase();
        const idUser = parseInt(user.id);
        const idReactTarget = parseInt(reaction.message.author?.id ?? "-1")
        // TODO: ADD BACK FOR PRODUCTION
        //if(idUser == idReactTarget || idReactTarget == -1) return;
        if(!emojiName) return;

        const dbUser = await prisma.user.upsert({
            where: {
                id: idUser
            },
            update: {

            },
            create: {
                id: idUser,
                username: user.username ?? "N/A"
            }
        })

        const reactionCounter = await prisma.userReactionCount.upsert({
            where: {
                idUser_emojiName: { idUser, emojiName },
            },
            create: {
                idUser,
                emojiName
            },
            update: {

            }
        })

        if(!reactionCounter) return;

        let reactCounterRecord = await prisma.userReaction.findFirst({
            where: {
                idReactTarget,
                idReactor: idUser,
                emojiName
            },
        })

        if(reactCounterRecord == null){
            reactCounterRecord = await prisma.userReaction.create({
                data: {
                    idReactor: idUser,
                    idReactTarget,
                    emojiName,
                    idReactionCounter: reactionCounter.id
                }
            });

            await prisma.userReactionCount.update({
                where: { id: reactionCounter.id },
                data: {
                    count: {
                        increment: 1
                    }
                }
            })

            addScore(idUser, SCORE_FOR_REACT)
        }
    })

    client.on(Events.MessageCreate, (message) => {
        addScore(parseInt(message.author.id), SCORE_FOR_MESSAGE)
    });


}