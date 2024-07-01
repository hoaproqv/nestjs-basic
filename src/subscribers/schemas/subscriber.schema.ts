import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { IUserSchema } from '../../users/schemas/user.schema';
import { Permission } from '../../permissions/schemas/permission.schema';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  skills: string[];

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

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
