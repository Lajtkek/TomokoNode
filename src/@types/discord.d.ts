import { Collection } from "discord.js";
import type { PrismaClient } from "../../generated/prisma/index.js";
import UserService from "../../services/userService.js";

declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
    prisma: PrismaClient;
    userService: UserService;
  }
}