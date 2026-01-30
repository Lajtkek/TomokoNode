import { Client, GatewayIntentBits, Events, type PartialUser, type User } from "discord.js";
import { PrismaClient } from "../generated/prisma/index.js";



export function addReactionCountModule(client: Client, prisma: PrismaClient){
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
        console.log(reactionCounter)
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
        }
    })

    client.on(Events.MessageCreate, (message) => {
        console.log(`${message.author.username} wrote: "${message.content}"`)
    });
}