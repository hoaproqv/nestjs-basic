import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ICompanySchema } from '../../companies/schemas/company.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

export class IUserSchema {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  address: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Object })
  company: ICompanySchema;

  @Prop()
  refreshToken: string;

  @Prop({ type: Object })
  createdBy: IUserSchema;

  @Prop({ type: Object })
  updatedBy: IUserSchema;

  @Prop({ type: Object })
  deletedBy: IUserSchema;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
