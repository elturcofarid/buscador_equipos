import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  OpportunityStatus,
  Prisma,
  VerificationStatus
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { SearchOpportunitiesDto } from "./dto/search-opportunities.dto";

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
    await this.assertCanManageClub(userId, dto.clubId);

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

  private async assertCanManageClub(userId: string, clubId: string) {
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        userId,
        clubId,
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
}
