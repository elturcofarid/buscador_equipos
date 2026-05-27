import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ApplicationStatus,
  OpportunityStatus,
  Prisma,
  UserRole,
  VerificationStatus
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, opportunityId: string, dto: CreateApplicationDto) {
    await this.assertPlayerAccount(userId);

    const playerProfile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            dateOfBirth: true
          }
        }
      }
    });

    if (!playerProfile) {
      throw new BadRequestException("Completa tu perfil de jugador antes de postular");
    }

    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        status: OpportunityStatus.ACTIVE
      }
    });

    if (!opportunity) {
      throw new NotFoundException("Busqueda activa no encontrada");
    }

    this.assertPlayerMeetsRestrictions(
      playerProfile.user.dateOfBirth,
      opportunity
    );

    const initialMessage = dto.message?.trim();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const application = await tx.application.create({
          data: {
            opportunityId,
            playerProfileId: playerProfile.id,
            message: initialMessage
          },
          include: {
            opportunity: {
              include: {
                club: true
              }
            },
            playerProfile: true
          }
        });

        const createdAt = application.createdAt;

        await tx.conversation.create({
          data: {
            applicationId: application.id,
            clubId: opportunity.clubId,
            playerProfileId: playerProfile.id,
            lastMessageAt: initialMessage ? createdAt : undefined,
            messages: initialMessage
              ? {
                  create: {
                    senderUserId: userId,
                    body: initialMessage,
                    createdAt
                  }
                }
              : undefined
          }
        });

        return application;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Ya postulaste a esta busqueda");
      }
      throw error;
    }
  }

  async getMine(userId: string) {
    await this.assertPlayerAccount(userId);

    const playerProfile = await this.prisma.playerProfile.findUnique({
      where: { userId }
    });

    if (!playerProfile) {
      return [];
    }

    return this.prisma.application.findMany({
      where: {
        playerProfileId: playerProfile.id
      },
      include: {
        opportunity: {
          include: {
            club: true,
            team: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getForClub(userId: string, clubId: string) {
    await this.assertCanManageClub(userId, clubId);

    return this.prisma.application.findMany({
      where: {
        opportunity: {
          clubId
        }
      },
      include: {
        playerProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        opportunity: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async updateStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto
  ) {
    const application = await this.findApplicationForClubAction(
      userId,
      applicationId
    );

    if (dto.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException("El club no puede retirar una postulacion");
    }

    return this.prisma.application.update({
      where: { id: application.id },
      data: { status: dto.status },
      include: {
        playerProfile: true,
        opportunity: true
      }
    });
  }

  async withdraw(userId: string, applicationId: string) {
    await this.assertPlayerAccount(userId);

    const playerProfile = await this.prisma.playerProfile.findUnique({
      where: { userId }
    });

    if (!playerProfile) {
      throw new NotFoundException("Perfil de jugador no encontrado");
    }

    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        playerProfileId: playerProfile.id
      }
    });

    if (!application) {
      throw new NotFoundException("Postulacion no encontrada");
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN }
    });
  }

  private async findApplicationForClubAction(
    userId: string,
    applicationId: string
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        opportunity: true
      }
    });

    if (!application) {
      throw new NotFoundException("Postulacion no encontrada");
    }

    await this.assertCanManageClub(userId, application.opportunity.clubId);

    return application;
  }

  private async assertCanManageClub(userId: string, clubId: string) {
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId,
        user: {
          primaryRole: UserRole.CLUB_MEMBER
        },
        verificationStatus: VerificationStatus.VERIFIED,
        club: {
          verificationStatus: VerificationStatus.VERIFIED
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException(
        "Solo responsables verificados del club pueden gestionar postulaciones"
      );
    }
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

  private assertPlayerMeetsRestrictions(
    dateOfBirth: Date,
    opportunity: { ageMin: number | null; ageMax: number | null }
  ) {
    const playerAge = this.getAge(dateOfBirth);

    if (opportunity.ageMin !== null && playerAge < opportunity.ageMin) {
      throw new BadRequestException(
        `Esta convocatoria requiere jugadores desde ${opportunity.ageMin} anos`
      );
    }

    if (opportunity.ageMax !== null && playerAge > opportunity.ageMax) {
      throw new BadRequestException(
        `Esta convocatoria acepta jugadores hasta ${opportunity.ageMax} anos`
      );
    }
  }

  private getAge(dateOfBirth: Date) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() &&
        today.getDate() >= dateOfBirth.getDate());

    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    return age;
  }
}
