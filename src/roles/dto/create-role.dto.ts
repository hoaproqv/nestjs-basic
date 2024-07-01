import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  isActive: boolean;

  @ArrayNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  permissions: mongoose.Schema.Types.ObjectId[];
}
