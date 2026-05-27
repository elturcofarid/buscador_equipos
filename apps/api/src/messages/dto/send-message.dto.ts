import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class SendMessageDto {
  @ApiProperty({ example: "Hola, podemos coordinar una prueba esta semana." })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}
