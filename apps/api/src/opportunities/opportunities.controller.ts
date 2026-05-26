import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AuthenticatedUser,
  CurrentUser
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { SearchOpportunitiesDto } from "./dto/search-opportunities.dto";
import { OpportunitiesService } from "./opportunities.service";

@ApiTags("opportunities")
@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  search(@Query() query: SearchOpportunitiesDto) {
    return this.opportunitiesService.search(query);
  }

  @Get(":opportunityId")
  getById(@Param("opportunityId") opportunityId: string) {
    return this.opportunitiesService.getById(opportunityId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOpportunityDto
  ) {
    return this.opportunitiesService.create(user.id, dto);
  }

  @Post(":opportunityId/publish")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param("opportunityId") opportunityId: string
  ) {
    return this.opportunitiesService.publish(user.id, opportunityId);
  }

  @Post(":opportunityId/pause")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  pause(
    @CurrentUser() user: AuthenticatedUser,
    @Param("opportunityId") opportunityId: string
  ) {
    return this.opportunitiesService.pause(user.id, opportunityId);
  }

  @Post(":opportunityId/close")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  close(
    @CurrentUser() user: AuthenticatedUser,
    @Param("opportunityId") opportunityId: string
  ) {
    return this.opportunitiesService.close(user.id, opportunityId);
  }
}
