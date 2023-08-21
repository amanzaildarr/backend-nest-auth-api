import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  findAll() {
    const Users = this.userModel.find({ deletedAt: null });
    return Users;
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
    return await user.save();
  }

  async remove(id: string) {
    await this.userModel.findByIdAndUpdate(id, { deletedAt: new Date() });
    return { success: true, message: this.i18n.t('user.USER_DELETED') };
  }
}
