import { Injectable } from "@nestjs/common";
import { VerificationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getPendingClubs() {
    return this.prisma.club.findMany({
      where: {
        verificationStatus: VerificationStatus.PENDING
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                primaryRole: true,
                status: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  approveClub(clubId: string) {
    return this.prisma.club.update({
      where: { id: clubId },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        members: {
          updateMany: {
            where: {
              verificationStatus: VerificationStatus.PENDING
            },
            data: {
              verificationStatus: VerificationStatus.VERIFIED
            }
          }
        }
      },
      include: {
        members: true
      }
    });
  }

  rejectClub(clubId: string) {
    return this.prisma.club.update({
      where: { id: clubId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        members: {
          updateMany: {
            where: {
              verificationStatus: VerificationStatus.PENDING
            },
            data: {
              verificationStatus: VerificationStatus.REJECTED
            }
          }
        }
      },
      include: {
        members: true
      }
    });
  }
}
