import { Client, GatewayIntentBits, Events, type PartialUser, type User, Guild, GuildMember } from "discord.js";
import { PrismaClient } from "../generated/prisma/index.js";

// todo dát všechny id jako string
// todo multiple reakce nepočítá ani jak count tak ani jak helperScore
// todo nečte historii

const SCORE_FOR_REACT = 1;
const SCORE_FOR_MESSAGE = 1;


export function addReactionCountModule(client: Client, prisma: PrismaClient){

    const roleConfig = process.env.ROLE_IDS?.split(",").map(x => {
    const touple = x.split("=")
        return {
            id: touple?.at(0) ?? "",
            count: parseInt(touple?.at(1) ?? "0")
        }
    }) ?? []

    async function addScore(user: User | PartialUser, guild: Guild, score: number){
        const id = parseInt(user.id);
        const res = await prisma.user.upsert({
            where: {
                id
            },
            update: {
                helperScore: {
                    increment: score
                }
            },
            create: {
                id,
                username: user.username ?? "",
            }
        })

        const rolesToHave = roleConfig.filter(x => res.helperScore >= x.count);
        if(rolesToHave.length == 0) return;

        console.log(`Adding roles ${rolesToHave.map(x => x.id)} to ${user.id}`)
        const member: GuildMember = await guild.members.fetch(user.id);
        console.log(rolesToHave.map(x => x.id))
        await member.roles.add(rolesToHave.map(x => x.id));
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

            await addScore(user, reaction.message.guild!, SCORE_FOR_REACT)
        }
    })

    client.on(Events.MessageCreate, async (message) => {
        // nepočítá se
        await addScore(message.author, message.guild!, SCORE_FOR_MESSAGE)
    });


}