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
import { SendMessageDto } from "./dto/send-message.dto";
import { MessagesService } from "./messages.service";

@ApiTags("messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("conversations")
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("clubId") clubId?: string
  ) {
    return this.messagesService.listConversations(user.id, clubId);
  }

  @Get("applications/:applicationId/conversation")
  getForApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Param("applicationId") applicationId: string
  ) {
    return this.messagesService.getOrCreateForApplication(
      user.id,
      applicationId
    );
  }

  @Get("conversations/:conversationId/messages")
  listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param("conversationId") conversationId: string
  ) {
    return this.messagesService.listMessages(user.id, conversationId);
  }

  @Post("conversations/:conversationId/messages")
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.messagesService.sendMessage(user.id, conversationId, dto);
  }
}
