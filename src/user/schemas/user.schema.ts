import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role, UserStatus } from '../enum/user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps:true})
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  phone: string;

  @Prop()
  country: string;

  @Prop()
  age: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: UserStatus.Active, enum: UserStatus })
  status: string;

  @Prop({ default: Role.User, enum: Role })
  role: string;

  // get fullName(): string {
  //   return `${this.firstName} ${this.lastName}`;
  // }
}

export const UserSchema = SchemaFactory.createForClass(User);