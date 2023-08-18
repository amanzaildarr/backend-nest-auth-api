import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly i18n: I18nService,
  ) {
    // Initialize the Passport JWT strategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
      ignoreExpiration: false, // Do not ignore token expiration
      secretOrKey: process.env.JWT_SECRET, // Secret key used to verify the token's signature
    });
  }

  // Validate method called by Passport when processing a JWT token
  async validate(payload: any) {
    const id = payload.id; // Extract the user ID from the JWT payload
    const user = await this.userModel.findById(id); // Find the user by ID in the database

    // If user doesn't exist, throw UnauthorizedException
    if (!user) {
      throw new UnauthorizedException(this.i18n.t('user.LOGIN'));
    }

    return user;
  }
}
