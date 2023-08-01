// import { IsString, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateUserDto {
    name: string;
    description: string;
    age: number;
}
