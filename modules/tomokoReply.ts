import { Client, Events, type PartialUser, type User, Guild, GuildMember, AllowedMentionsTypes } from "discord.js";
import { PrismaClient } from "../generated/prisma/index.js";
import { ChatGPTAPI } from "chatgpt";
import gptConfig from "../gptConfig.ts";

export function addTomokoReplyModule(client: Client, prisma: PrismaClient, chatGpt: ChatGPTAPI) {
    client.on(Events.MessageCreate, async (message) => {
        const channelId = message.channelId;
        const author = message.member?.partial ? await message.member.fetch() : message.member;

        if(!message.content.includes("<@1465233109640286261>")) return;
        if(!gptConfig.allowedChannels.includes(channelId) ) return;
        if(!author || author?.user.bot) return;
        if(!gptConfig.allowedRoles.some(x => author.roles.cache.has(x))) return;


        //const messages = await message.channel.messages.fetch({ limit: gptConfig.contextLength })
        
        const result = await chatGpt.sendMessage(message.content, {
            systemMessage: process.env.TOMOKO_CONFIG ?? ""
            
        })

        message.reply({
            content: result.text,
            allowedMentions: { 
                parse: []
            }
        })
        
    });
}