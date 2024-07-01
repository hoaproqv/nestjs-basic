import { IsIn, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  apiPath: string;

  @IsNotEmpty()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method: string;

  @IsNotEmpty()
  module: string;
}
