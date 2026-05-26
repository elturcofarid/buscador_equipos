import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender, Modality, VisibilityLevel } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

export class UpsertPlayerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryPosition?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryPositions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dominantFoot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: Modality })
  @IsOptional()
  @IsEnum(Modality)
  modality?: Modality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  availabilityStatus?: string;

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

  @ApiPropertyOptional({ minimum: 1, maximum: 200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  searchRadiusKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ enum: VisibilityLevel })
  @IsOptional()
  @IsEnum(VisibilityLevel)
  visibilityLevel?: VisibilityLevel;
}
