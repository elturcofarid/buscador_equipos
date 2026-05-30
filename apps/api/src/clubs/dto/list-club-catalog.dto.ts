import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListClubCatalogDto {
  @ApiPropertyOptional({ example: "Real Federacion de Futbol de Madrid" })
  @IsOptional()
  @IsString()
  federation?: string;

  @ApiPropertyOptional({ example: "Juvenil" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "Preferente" })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: "Alcobendas" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 25, maximum: 50, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
