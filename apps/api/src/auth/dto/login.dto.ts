import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "jugador@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "super-secret-password" })
  @IsString()
  password!: string;
}
