import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

class User {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
}

@Schema({ timestamps: true })
export class Company {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: User })
  createdBy: User;

  @Prop({ type: User })
  updatedBy: User;

  @Prop({ type: User })
  deletedBy: User;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
