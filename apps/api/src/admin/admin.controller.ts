import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("clubs/pending")
  getPendingClubs() {
    return this.adminService.getPendingClubs();
  }

  @Post("clubs/:clubId/approve")
  approveClub(@Param("clubId") clubId: string) {
    return this.adminService.approveClub(clubId);
  }

  @Post("clubs/:clubId/reject")
  rejectClub(@Param("clubId") clubId: string) {
    return this.adminService.rejectClub(clubId);
  }
}
