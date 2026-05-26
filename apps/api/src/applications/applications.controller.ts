import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AuthenticatedUser,
  CurrentUser
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

@ApiTags("applications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post("opportunities/:opportunityId/applications")
  apply(
    @CurrentUser() user: AuthenticatedUser,
    @Param("opportunityId") opportunityId: string,
    @Body() dto: CreateApplicationDto
  ) {
    return this.applicationsService.apply(user.id, opportunityId, dto);
  }

  @Get("players/me/applications")
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.getMine(user.id);
  }

  @Get("clubs/:clubId/applications")
  getForClub(
    @CurrentUser() user: AuthenticatedUser,
    @Param("clubId") clubId: string
  ) {
    return this.applicationsService.getForClub(user.id, clubId);
  }

  @Put("applications/:applicationId/status")
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("applicationId") applicationId: string,
    @Body() dto: UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(
      user.id,
      applicationId,
      dto
    );
  }

  @Post("applications/:applicationId/withdraw")
  withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Param("applicationId") applicationId: string
  ) {
    return this.applicationsService.withdraw(user.id, applicationId);
  }
}
