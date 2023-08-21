import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { SignUpInput } from './dto/singup.dto';
import { LoginInput } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SocialLoginDto } from './dto/social-login.dto';
import { I18nService } from 'nestjs-i18n';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendLinkDto } from './dto/send-link.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

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
    const user = await this.userModel.findOne({ email: loginInput.email });

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CREDENTIALS'));
    }
    const isValid = await bcrypt.compare(loginInput.password, user.password);
    if (!isValid) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CREDENTIALS'));
    }
    const res = {
      ...user.toObject(),
      token: this.jwtService.sign({ id: user._id }),
    };

    return res;
  }

  async socialLogin(socialLoginInput: SocialLoginDto) {
    var User = await this.userModel.findOne({ email: socialLoginInput.email });

    var token: string;

    if (!User) {
      User = new this.userModel(socialLoginInput);
    }

    User.lastLogin = new Date();
    User = await User.save();

    token = this.jwtService.sign({ id: User._id });

    return { User, token };
  }

  async sendLink(sendLinkInput: SendLinkDto) {
    const User = await this.userModel.findOne({ email: sendLinkInput.email });

    if (!User) {
      throw new NotFoundException(this.i18n.t('user.EMAIL_NOT_EXISTS'));
    }

    // send the mail to user.email with resetpassword link and token in link

    return { success: true, message: this.i18n.t('user.MAIL_SENT') };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const User = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });

    if (!User) {
      throw new NotFoundException(this.i18n.t('user.EMAIL_NOT_EXISTS'));
    }

    if (forgotPasswordDto.password !== forgotPasswordDto.confirm_password) {
      throw new HttpException(
        this.i18n.t('auth.PASSWORD_NOT_MATCH'),
        HttpStatus.BAD_REQUEST,
      );
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(forgotPasswordDto.password, salt);

    User.password = hashedPassword;
    await User.save();

    return { success: true, message: this.i18n.t('auth.PASSWORD_UPDATED') };
  }

  async resetPassword(user: User, resetPasswordDto: ResetPasswordDto) {
    const User = await this.userModel.findOne({ email: user.email });

    const isValid = await bcrypt.compare(
      resetPasswordDto.old_password,
      user.password,
    );
    if (!isValid) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_OLD_PASSWORD'));
    }

    if (resetPasswordDto.new_password !== resetPasswordDto.confirm_password) {
      throw new HttpException(
        this.i18n.t('auth.PASSWORD_NOT_MATCH'),
        HttpStatus.BAD_REQUEST,
      );
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.new_password,
      salt,
    );

    User.password = hashedPassword;
    await User.save();

    return { success: true, message: this.i18n.t('auth.PASSWORD_UPDATED') };
  }
}
