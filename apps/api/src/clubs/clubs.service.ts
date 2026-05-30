import {
  ConflictException,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import {
  ClubRole,
  Prisma,
  UserRole,
  VerificationStatus
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClubDto } from "./dto/create-club.dto";
import { JoinClubDto } from "./dto/join-club.dto";
import { ListClubCatalogDto } from "./dto/list-club-catalog.dto";

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(userId: string, dto: CreateClubDto) {
    await this.assertClubAccount(userId);

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

  async getMyMemberships(userId: string) {
    await this.assertClubAccount(userId);

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

  async getCatalog(userId: string, dto: ListClubCatalogDto) {
    await this.assertClubAccount(userId);

    const where: Prisma.ClubWhereInput[] = [
      {
        federationSource: {
          not: null
        }
      },
      {
        verificationStatus: {
          notIn: [VerificationStatus.REJECTED, VerificationStatus.REVOKED]
        }
      }
    ];
    const federation = this.cleanFilter(dto.federation);
    const category = this.cleanFilter(dto.category);
    const level = this.cleanFilter(dto.level);
    const search = this.cleanFilter(dto.search);

    if (federation) {
      where.push({
        OR: [
          {
            federationSource: {
              contains: federation,
              mode: "insensitive"
            }
          },
          {
            federationRegion: {
              contains: federation,
              mode: "insensitive"
            }
          }
        ]
      });
    }

    if (category) {
      where.push({
        teams: {
          some: this.teamTextFilter(category)
        }
      });
    }

    if (level) {
      where.push({
        teams: {
          some: this.teamTextFilter(level)
        }
      });
    }

    if (search) {
      where.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            normalizedName: {
              contains: this.normalizeName(search)
            }
          },
          {
            federationCode: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            city: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            province: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            teams: {
              some: this.teamTextFilter(search)
            }
          }
        ]
      });
    }

    const limit = Math.min(Math.max(dto.limit ?? 25, 1), 50);

    return this.prisma.club.findMany({
      where: {
        AND: where
      },
      include: {
        teams: {
          orderBy: [{ season: "desc" }, { category: "asc" }, { name: "asc" }],
          take: 8
        }
      },
      orderBy: [{ federationSource: "asc" }, { name: "asc" }],
      take: limit
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
    await this.assertClubAccount(userId);

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

  private cleanFilter(value?: string) {
    const trimmedValue = value?.trim();
    return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  private teamTextFilter(value: string): Prisma.TeamWhereInput {
    return {
      OR: [
        {
          name: {
            contains: value,
            mode: "insensitive"
          }
        },
        {
          category: {
            contains: value,
            mode: "insensitive"
          }
        }
      ]
    };
  }

  private async assertHasClubMembership(userId: string, clubId: string) {
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId,
        user: {
          primaryRole: UserRole.CLUB_MEMBER
        },
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

  private async assertClubAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryRole: true }
    });

    if (user?.primaryRole !== UserRole.CLUB_MEMBER) {
      throw new ForbiddenException(
        "Esta accion solo esta disponible para cuentas de club"
      );
    }
  }
}
