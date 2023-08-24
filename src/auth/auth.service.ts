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
  ) { }

  /**
   * Registers a new user.
   * @param signUpInput - The signup data including name, email, and password.
   * @returns The newly created user.
   */
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

    return newUser;
  }

  /**
   * Authenticates a user and returns a JWT token.
   * @param loginInput - The login data including email and password.
   * @returns An object with user data and JWT token.
   */
  async login(loginInput: LoginInput) {
    const User = await this.userModel.findOne({ email: loginInput.email });

    if (!User) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CREDENTIALS'));
    }
    const isValid = await bcrypt.compare(loginInput.password, User.password);
    if (!isValid) {
      throw new BadRequestException(this.i18n.t('auth.INVALID_CREDENTIALS'));
    }
    const res = {
      user: User,
      accessToken: this.jwtService.sign({ id: User._id }),
    };

    return res;
  }

  /**
   * Handles social login and returns user data and token.
   * @param socialLoginInput - The social login data including email and other details.
   * @returns An object with user data and token.
   */
  async socialLogin(socialLoginInput: SocialLoginDto) {
    var User = await this.userModel.findOne({ email: socialLoginInput.email });

    var accessToken: string;

    if (!User) {
      User = new this.userModel(socialLoginInput);
    }

    User.lastLogin = new Date();
    User = await User.save();

    accessToken = this.jwtService.sign({ id: User._id });

    return { user: User, accessToken };
  }

  /**
   * Sends a password reset link to the user's email.
   * @param sendLinkInput - The data including the user's email.
   * @returns A response indicating success or failure.
   */
  async sendLink(sendLinkInput: SendLinkDto) {
    const User = await this.userModel.findOne({ email: sendLinkInput.email });

    if (!User) {
      throw new NotFoundException(this.i18n.t('user.EMAIL_NOT_EXISTS'));
    }

    // send the mail to user.email with resetpassword link and token in link

    return { success: true, message: this.i18n.t('user.MAIL_SENT') };
  }

  /**
   * Handles the password reset process.
   * @param forgotPasswordDto - The data including email, new password, and confirmation.
   * @returns A response indicating success or failure.
   */
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

  /**
   * Resets the user's password.
   * @param user - The user for whom the password is being reset.
   * @param resetPasswordDto - The data including old password, new password, and confirmation.
   * @returns A response indicating success or failure.
   */
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
