import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  AuthenticatedUser,
  CurrentUser
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpsertPlayerProfileDto } from "./dto/upsert-player-profile.dto";
import { PlayersService } from "./players.service";

@ApiTags("players")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("players")
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.playersService.getProfile(user.id);
  }

  @Put("me")
  upsertMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertPlayerProfileDto
  ) {
    return this.playersService.upsertProfile(user.id, dto);
  }
}
