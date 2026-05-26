import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "jugador@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Nombre Apellido" })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: "2000-01-01" })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: "super-secret-password" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
