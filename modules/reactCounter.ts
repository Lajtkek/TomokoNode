import { Client, GatewayIntentBits, Events } from "discord.js";

export function addReactionCountModule(client: Client){

    client.on(Events.MessageReactionAdd, (reaction, user) => {
        console.log(`${user.username} reacted ${reaction.emoji} na "${reaction.message.content}"`)
    })

    client.on(Events.MessageCreate, (message) => {
        console.log(`${message.author.username} wrote: "${message.content}"`)
    });
}