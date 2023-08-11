import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const isMailValid = await this.userModel.findOne({
      email: createUserInput.email,
    });
    if (isMailValid) {
      throw new BadRequestException('Email already exists');
    }
    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserInput.password, salt);

    const newUser = new this.userModel(createUserInput);

    newUser.password = hashedPassword;
    await newUser.save();

    const { password, ...user } = newUser.toObject();

    return newUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(this.i18n.t('user.NOT_FOUND'));
    }
    const { password, ...rest } = user.toObject();
    return rest;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);
    for (const key in updateUserDto) {
      user[key] = updateUserDto[key];
    }
    await user.save();
    return user;
    // return UserResponse.decode(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
