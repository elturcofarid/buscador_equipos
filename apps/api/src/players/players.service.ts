import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertPlayerProfileDto } from "./dto/upsert-player-profile.dto";

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    await this.assertPlayerAccount(userId);

    return this.prisma.playerProfile.findUnique({
      where: { userId }
    });
  }

  async upsertProfile(userId: string, dto: UpsertPlayerProfileDto) {
    await this.assertPlayerAccount(userId);

    return this.prisma.playerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...dto
      },
      update: dto
    });
  }

  private async assertPlayerAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryRole: true }
    });

    if (user?.primaryRole !== UserRole.PLAYER) {
      throw new ForbiddenException(
        "Esta accion solo esta disponible para cuentas de jugador"
      );
    }
  }
}
