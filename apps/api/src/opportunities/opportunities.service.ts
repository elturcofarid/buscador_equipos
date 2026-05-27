import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  OpportunityStatus,
  Prisma,
  UserRole,
  VerificationStatus
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { SearchOpportunitiesDto } from "./dto/search-opportunities.dto";
import { UpdateOpportunityDto } from "./dto/update-opportunity.dto";

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  search(query: SearchOpportunitiesDto) {
    const where: Prisma.OpportunityWhereInput = {
      status: OpportunityStatus.ACTIVE,
      ...(query.category ? { category: query.category } : {}),
      ...(query.gender ? { gender: query.gender } : {}),
      ...(query.modality ? { modality: query.modality } : {}),
      ...(query.location
        ? {
            locationLabel: {
              contains: query.location,
              mode: "insensitive"
            }
          }
        : {}),
      ...(query.position
        ? {
            OR: [
              {
                primaryPosition: {
                  contains: query.position,
                  mode: "insensitive"
                }
              },
              {
                secondaryPositions: {
                  has: query.position
                }
              }
            ]
          }
        : {})
    };

    return this.prisma.opportunity.findMany({
      where,
      include: {
        club: true,
        team: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: query.limit ?? 20
    });
  }

  async getById(opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        status: OpportunityStatus.ACTIVE
      },
      include: {
        club: true,
        team: true
      }
    });

    if (!opportunity) {
      throw new NotFoundException("Busqueda no encontrada");
    }

    return opportunity;
  }

  async create(userId: string, dto: CreateOpportunityDto) {
    await this.assertCanCreateDraftForClub(userId, dto.clubId);
    this.assertValidAgeRange(dto.ageMin, dto.ageMax);

    return this.prisma.opportunity.create({
      data: {
        clubId: dto.clubId,
        teamId: dto.teamId,
        createdByUserId: userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        gender: dto.gender,
        modality: dto.modality,
        primaryPosition: dto.primaryPosition,
        secondaryPositions: dto.secondaryPositions ?? [],
        ageMin: dto.ageMin,
        ageMax: dto.ageMax,
        locationLabel: dto.locationLabel,
        locationLat: dto.locationLat,
        locationLng: dto.locationLng,
        level: dto.level,
        opportunityType: dto.opportunityType,
        requirements: dto.requirements,
        deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : undefined,
        status: OpportunityStatus.DRAFT
      },
      include: {
        club: true,
        team: true
      }
    });
  }

  async publish(userId: string, opportunityId: string) {
    const opportunity = await this.findOwnedOpportunity(userId, opportunityId);
    await this.assertCanManageClub(userId, opportunity.clubId);

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.ACTIVE },
      include: {
        club: true,
        team: true
      }
    });
  }

  async update(userId: string, opportunityId: string, dto: UpdateOpportunityDto) {
    const opportunity = await this.findOwnedOpportunity(userId, opportunityId);
    await this.assertCanEditOpportunity(userId, opportunity);
    this.assertValidAgeRange(
      dto.ageMin === undefined ? opportunity.ageMin : dto.ageMin,
      dto.ageMax === undefined ? opportunity.ageMax : dto.ageMax
    );

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: this.toOpportunityUpdateData(dto),
      include: {
        club: true,
        team: true
      }
    });
  }

  async remove(userId: string, opportunityId: string) {
    const opportunity = await this.findOwnedOpportunity(userId, opportunityId);
    await this.assertCanEditOpportunity(userId, opportunity);

    const applicationsCount = await this.prisma.application.count({
      where: { opportunityId }
    });

    if (opportunity.status === OpportunityStatus.DRAFT && applicationsCount === 0) {
      return this.prisma.opportunity.delete({
        where: { id: opportunityId },
        include: {
          club: true,
          team: true
        }
      });
    }

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.CLOSED },
      include: {
        club: true,
        team: true
      }
    });
  }

  async pause(userId: string, opportunityId: string) {
    const opportunity = await this.findOwnedOpportunity(userId, opportunityId);
    await this.assertCanManageClub(userId, opportunity.clubId);

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.PAUSED }
    });
  }

  async close(userId: string, opportunityId: string) {
    const opportunity = await this.findOwnedOpportunity(userId, opportunityId);
    await this.assertCanManageClub(userId, opportunity.clubId);

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.CLOSED }
    });
  }

  private async findOwnedOpportunity(userId: string, opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      throw new NotFoundException("Busqueda no encontrada");
    }

    if (opportunity.createdByUserId !== userId) {
      await this.assertCanManageClub(userId, opportunity.clubId);
    }

    return opportunity;
  }

  private async assertCanEditOpportunity(
    userId: string,
    opportunity: { clubId: string; status: OpportunityStatus }
  ) {
    if (opportunity.status === OpportunityStatus.CLOSED) {
      throw new BadRequestException(
        "No se puede modificar una convocatoria cerrada"
      );
    }

    if (opportunity.status === OpportunityStatus.DRAFT) {
      await this.assertCanCreateDraftForClub(userId, opportunity.clubId);
      return;
    }

    await this.assertCanManageClub(userId, opportunity.clubId);
  }

  private toOpportunityUpdateData(dto: UpdateOpportunityDto) {
    return {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      gender: dto.gender,
      modality: dto.modality,
      primaryPosition: dto.primaryPosition,
      secondaryPositions: dto.secondaryPositions,
      ageMin: dto.ageMin,
      ageMax: dto.ageMax,
      locationLabel: dto.locationLabel,
      locationLat: dto.locationLat,
      locationLng: dto.locationLng,
      level: dto.level,
      opportunityType: dto.opportunityType,
      requirements: dto.requirements,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : undefined
    };
  }

  private assertValidAgeRange(
    ageMin?: number | null,
    ageMax?: number | null
  ) {
    if (
      ageMin !== undefined &&
      ageMin !== null &&
      ageMax !== undefined &&
      ageMax !== null &&
      ageMin > ageMax
    ) {
      throw new BadRequestException(
        "La edad minima no puede ser mayor que la edad maxima"
      );
    }
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
        "Solo responsables verificados de clubes verificados pueden publicar busquedas"
      );
    }
  }

  private async assertCanCreateDraftForClub(userId: string, clubId: string) {
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
      throw new ForbiddenException(
        "Solo responsables del club pueden crear borradores de busquedas"
      );
    }
  }
}
