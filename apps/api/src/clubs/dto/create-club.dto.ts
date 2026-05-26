import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateClubDto {
  @ApiProperty({ example: "CD Ejemplo Madrid" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: "Madrid" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "Madrid" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: "Real Federacion de Futbol de Madrid" })
  @IsOptional()
  @IsString()
  federationRegion?: string;

  @ApiPropertyOptional({ example: "https://club.example.com" })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: "contacto@club.example.com" })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
