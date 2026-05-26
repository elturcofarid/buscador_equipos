import { ApiPropertyOptional } from "@nestjs/swagger";
import { ClubRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class JoinClubDto {
  @ApiPropertyOptional({ enum: ClubRole })
  @IsOptional()
  @IsEnum(ClubRole)
  role?: ClubRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verificationMethod?: string;
}
