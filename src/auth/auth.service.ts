import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { SignUpInput } from './dto/singup.dto';
import { LoginInput } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SocialLoginDto } from './dto/social.login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async signUp(signUpInput: SignUpInput) {
    const isMailValid = await this.userModel.findOne({
      email: signUpInput.email,
    });
    if (isMailValid) {
      throw new BadRequestException('Email already exists');
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(signUpInput.password, salt);

    const newUser = new this.userModel(signUpInput);

    newUser.password = hashedPassword;
    await newUser.save();

    const { password, ...user } = newUser.toObject();

    return newUser;
  }

  async login(loginInput: LoginInput) {
    console.log('loginInput',loginInput);
    
    const user = await this.userModel.findOne({ email: loginInput.email });

    if (!user) {
      throw new BadRequestException('Email not exists');
    }
    const isValid = await bcrypt.compare(loginInput.password, user.password);
    if (!isValid) {
      throw new BadRequestException('Password not valid');
    }
    const res = { ...user.toObject(), token: this.jwtService.sign({ id: user._id }) }

    return res;
  }

  async socialLogin(socialLoginInput: SocialLoginDto) {

    var User = await this.userModel.findOne({ email: socialLoginInput.email });

    var token: string;

    if (!User) {
      User = new this.userModel(socialLoginInput);
    }
    User.lastLogin = new Date();
    await User.save()

    token = this.jwtService.sign({ id: User._id })

    return {User,token};
  }
}
