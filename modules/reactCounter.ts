import { Client, GatewayIntentBits, Events } from "discord.js";

export function addReactionCountModule(client: Client){

    client.on(Events.MessageReactionAdd, (reaction, user) => {
        console.log("n")
        console.log(reaction.emoji)
    })

    client.on(Events.MessageCreate, (message) => {
        console.log(`${message.author.username} wrote: "${message.content}"`)
    });
}