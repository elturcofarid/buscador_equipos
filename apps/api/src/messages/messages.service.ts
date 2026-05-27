import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ApplicationStatus,
  Prisma,
  UserRole,
  VerificationStatus
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

const conversationInclude = {
  application: {
    include: {
      opportunity: {
        include: {
          club: true,
          team: true
        }
      }
    }
  },
  club: true,
  playerProfile: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      }
    }
  },
  messages: {
    orderBy: {
      createdAt: "desc"
    },
    take: 1,
    include: {
      senderUser: {
        select: {
          id: true,
          fullName: true,
          primaryRole: true
        }
      }
    }
  }
} satisfies Prisma.ConversationInclude;

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string, clubId?: string) {
    const role = await this.getUserRole(userId);

    if (role === UserRole.PLAYER) {
      const playerProfile = await this.prisma.playerProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (!playerProfile) {
        return [];
      }

      return this.prisma.conversation.findMany({
        where: {
          playerProfileId: playerProfile.id
        },
        include: conversationInclude,
        orderBy: [
          {
            lastMessageAt: "desc"
          },
          {
            createdAt: "desc"
          }
        ]
      });
    }

    if (role === UserRole.CLUB_MEMBER) {
      const clubIds = clubId
        ? [await this.assertCanManageClub(userId, clubId)]
        : await this.getManageableClubIds(userId);

      if (clubIds.length === 0) {
        return [];
      }

      return this.prisma.conversation.findMany({
        where: {
          clubId: {
            in: clubIds
          }
        },
        include: conversationInclude,
        orderBy: [
          {
            lastMessageAt: "desc"
          },
          {
            createdAt: "desc"
          }
        ]
      });
    }

    throw new ForbiddenException("No tienes acceso a conversaciones");
  }

  async getOrCreateForApplication(userId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        opportunity: true,
        playerProfile: true
      }
    });

    if (!application) {
      throw new NotFoundException("Postulacion no encontrada");
    }

    await this.assertCanAccessApplication(userId, application);

    const existingConversation = await this.prisma.conversation.findUnique({
      where: { applicationId },
      include: conversationInclude
    });

    if (existingConversation) {
      return existingConversation;
    }

    const initialMessage = application.message?.trim();

    try {
      return await this.prisma.conversation.create({
        data: {
          applicationId,
          clubId: application.opportunity.clubId,
          playerProfileId: application.playerProfileId,
          lastMessageAt: initialMessage ? application.createdAt : undefined,
          messages: initialMessage
            ? {
                create: {
                  senderUserId: application.playerProfile.userId,
                  body: initialMessage,
                  createdAt: application.createdAt
                }
              }
            : undefined
        },
        include: conversationInclude
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return this.prisma.conversation.findUniqueOrThrow({
          where: { applicationId },
          include: conversationInclude
        });
      }

      throw error;
    }
  }

  async listMessages(userId: string, conversationId: string) {
    await this.assertCanAccessConversation(userId, conversationId);

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        senderUser: {
          select: {
            id: true,
            fullName: true,
            primaryRole: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto
  ) {
    const body = dto.body.trim();

    if (!body) {
      throw new BadRequestException("El mensaje no puede estar vacio");
    }

    const conversation = await this.assertCanAccessConversation(
      userId,
      conversationId
    );

    if (conversation.application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException(
        "No se puede enviar mensajes en una postulacion retirada"
      );
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderUserId: userId,
          body,
          createdAt: now
        },
        include: {
          senderUser: {
            select: {
              id: true,
              fullName: true,
              primaryRole: true
            }
          }
        }
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now }
      });

      return message;
    });
  }

  private async assertCanAccessConversation(
    userId: string,
    conversationId: string
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        application: true,
        playerProfile: true
      }
    });

    if (!conversation) {
      throw new NotFoundException("Conversacion no encontrada");
    }

    await this.assertCanAccessApplication(userId, {
      ...conversation.application,
      playerProfile: conversation.playerProfile,
      opportunity: {
        clubId: conversation.clubId
      }
    });

    return conversation;
  }

  private async assertCanAccessApplication(
    userId: string,
    application: {
      opportunity: { clubId: string };
      playerProfile: { userId: string };
    }
  ) {
    const role = await this.getUserRole(userId);

    if (role === UserRole.PLAYER && application.playerProfile.userId === userId) {
      return;
    }

    if (role === UserRole.CLUB_MEMBER) {
      await this.assertCanManageClub(userId, application.opportunity.clubId);
      return;
    }

    throw new ForbiddenException("No tienes acceso a esta conversacion");
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
      },
      select: {
        clubId: true
      }
    });

    if (!membership) {
      throw new ForbiddenException(
        "Solo responsables verificados del club pueden gestionar mensajes"
      );
    }

    return membership.clubId;
  }

  private async getManageableClubIds(userId: string) {
    const memberships = await this.prisma.clubMember.findMany({
      where: {
        userId,
        user: {
          primaryRole: UserRole.CLUB_MEMBER
        },
        verificationStatus: VerificationStatus.VERIFIED,
        club: {
          verificationStatus: VerificationStatus.VERIFIED
        }
      },
      select: {
        clubId: true
      }
    });

    return memberships.map((membership) => membership.clubId);
  }

  private async getUserRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryRole: true }
    });

    if (!user) {
      throw new ForbiddenException("Usuario no encontrado");
    }

    return user.primaryRole;
  }
}
