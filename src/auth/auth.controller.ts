import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SendLinkDto } from './dto/send-link.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/user/decorator/user.decorator';
import { User } from 'src/user/schemas/user.schema';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Post('/social')
  socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }

  @Post('/forgotPassword')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/resetPassword')
  @UseGuards(AuthGuard())
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.resetPassword(user, resetPasswordDto);
  }

  @Post('/sendlink') // send forgotpassword link in mail
  sendLink(@Body() sendLinkDto: SendLinkDto) {
    return this.authService.sendLink(sendLinkDto);
  }
}
