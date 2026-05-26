import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateOpportunityDto {
  @ApiProperty()
  @IsString()
  clubId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ example: "Buscamos portero para senior preferente" })
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ enum: Modality })
  @IsEnum(Modality)
  modality!: Modality;

  @ApiProperty({ example: "Portero" })
  @IsString()
  primaryPosition!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryPositions?: string[];

  @ApiPropertyOptional({ minimum: 18 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  ageMin?: number;

  @ApiPropertyOptional({ minimum: 18 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  ageMax?: number;

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

  @ApiProperty({ enum: OpportunityType })
  @IsEnum(OpportunityType)
  opportunityType!: OpportunityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadlineAt?: string;
}
