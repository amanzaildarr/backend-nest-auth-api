import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role, UserStatus } from '../enum/user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: null})
  socialProvider: string;

  @Prop({ default: null})
  providerAccountId: string;

  @Prop({ default: UserStatus.Active, enum: UserStatus })
  status: string;

  @Prop({ default: Role.Viewer, enum: Role })
  role: string;

  @Prop({ default: false })
  isMailVerified: boolean

  @Prop({ default: null })
  lastLogin: Date

  @Prop({ default: null })
  deletedAt: Date

}

export const UserSchema = SchemaFactory.createForClass(User);
