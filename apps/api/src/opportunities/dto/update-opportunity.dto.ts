import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender, Modality, OpportunityType } from "@prisma/client";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

export class UpdateOpportunityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: Modality })
  @IsOptional()
  @IsEnum(Modality)
  modality?: Modality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryPosition?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryPositions?: string[];

  @ApiPropertyOptional({ minimum: 5, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(99)
  ageMin?: number | null;

  @ApiPropertyOptional({ minimum: 5, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(99)
  ageMax?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ enum: OpportunityType })
  @IsOptional()
  @IsEnum(OpportunityType)
  opportunityType?: OpportunityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadlineAt?: string;
}
