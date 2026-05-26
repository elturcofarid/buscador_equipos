import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AuthenticatedUser,
  CurrentUser
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ClubsService } from "./clubs.service";
import { CreateClubDto } from "./dto/create-club.dto";
import { JoinClubDto } from "./dto/join-club.dto";

@ApiTags("clubs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("clubs")
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClubDto) {
    return this.clubsService.createClub(user.id, dto);
  }

  @Get("mine")
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.clubsService.getMyMemberships(user.id);
  }

  @Get(":clubId/opportunities")
  getOpportunities(
    @CurrentUser() user: AuthenticatedUser,
    @Param("clubId") clubId: string
  ) {
    return this.clubsService.getClubOpportunities(user.id, clubId);
  }

  @Post(":clubId/join-request")
  joinRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("clubId") clubId: string,
    @Body() dto: JoinClubDto
  ) {
    return this.clubsService.requestMembership(user.id, clubId, dto);
  }
}
