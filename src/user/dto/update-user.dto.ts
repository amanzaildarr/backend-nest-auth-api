import { PartialType } from '@nestjs/mapped-types';
import { SignUpInput } from 'src/auth/dto/singup.dto';

export class UpdateUserDto extends PartialType(SignUpInput) {}
