import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './database/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) { }

  async create(createUserInput: CreateUserInput) {

    const isMailValid = await this.userModel.findOne({ email: createUserInput.email })
    if (isMailValid) {
      throw new BadRequestException('Email already exists');
    }
    // encrypt password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(createUserInput.password, salt)
    
    const newUser = new this.userModel(createUserInput)

    newUser.password = hashedPassword;
    await newUser.save()
    
    const { password, ...user } = newUser.toObject();

    return newUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id)
    const { password, ...rest } = user.toObject()
    return rest;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
