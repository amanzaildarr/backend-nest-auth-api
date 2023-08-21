import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendLinkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
