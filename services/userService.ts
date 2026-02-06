/// <reference path="../src/@types/discord.d.ts" />
import { Client, User, type PartialUser } from "discord.js";


export default class UserService {
    private discordClient;
    private prisma;

    constructor(client: Client) {
        this.discordClient = client;
        this.prisma = client.prisma;
    }

    public async getDbUser(discordUser: PartialUser | User){
        const user = await this.prisma.user.upsert({
            where: {
                id: discordUser.id
            },
            update: {

            },
            create: {
                id: discordUser.id,
                username: discordUser.username ?? "N/A"
            }
        })

        return user;
    }
}