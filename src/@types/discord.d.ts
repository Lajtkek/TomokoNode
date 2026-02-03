import { Collection } from "discord.js";
import type { PrismaClient } from "../../generated/prisma/index.js";

declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
    prisma: PrismaClient;
  }
}