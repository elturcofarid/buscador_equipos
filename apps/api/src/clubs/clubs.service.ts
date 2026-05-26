import {
  ConflictException,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { ClubRole, Prisma, VerificationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClubDto } from "./dto/create-club.dto";
import { JoinClubDto } from "./dto/join-club.dto";

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(userId: string, dto: CreateClubDto) {
    return this.prisma.club.create({
      data: {
        name: dto.name,
        normalizedName: this.normalizeName(dto.name),
        city: dto.city,
        province: dto.province,
        federationRegion: dto.federationRegion,
        website: dto.website,
        contactEmail: dto.contactEmail?.toLowerCase(),
        verificationStatus: VerificationStatus.PENDING,
        members: {
          create: {
            userId,
            role: ClubRole.OWNER,
            verificationStatus: VerificationStatus.PENDING,
            verificationMethod: "manual"
          }
        }
      },
      include: {
        members: true
      }
    });
  }

  getMyMemberships(userId: string) {
    return this.prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getClubOpportunities(userId: string, clubId: string) {
    await this.assertHasClubMembership(userId, clubId);

    return this.prisma.opportunity.findMany({
      where: {
        clubId
      },
      include: {
        club: true,
        team: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async requestMembership(userId: string, clubId: string, dto: JoinClubDto) {
    try {
      return await this.prisma.clubMember.create({
        data: {
          clubId,
          userId,
          role: dto.role ?? ClubRole.STAFF,
          verificationMethod: dto.verificationMethod ?? "manual",
          verificationStatus: VerificationStatus.PENDING
        },
        include: {
          club: true
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Ya existe una solicitud para este club");
      }
      throw error;
    }
  }

  private normalizeName(name: string) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  private async assertHasClubMembership(userId: string, clubId: string) {
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId,
        verificationStatus: {
          notIn: [VerificationStatus.REJECTED, VerificationStatus.REVOKED]
        },
        club: {
          verificationStatus: {
            notIn: [VerificationStatus.REJECTED, VerificationStatus.REVOKED]
          }
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException("No tienes acceso a este club");
    }
  }
}
