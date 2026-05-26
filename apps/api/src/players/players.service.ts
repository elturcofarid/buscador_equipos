import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertPlayerProfileDto } from "./dto/upsert-player-profile.dto";

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.playerProfile.findUnique({
      where: { userId }
    });
  }

  upsertProfile(userId: string, dto: UpsertPlayerProfileDto) {
    return this.prisma.playerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...dto
      },
      update: dto
    });
  }
}
