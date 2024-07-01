import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../../users/users.interface';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private roleService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    const userRole = role as unknown as { _id: string; name: string };
    const temp = (await this.roleService.findOne(userRole._id)).toObject();
    return {
      _id,
      name,
      email,
      role,
      permissions: temp?.permissions ?? [],
    };
  }
}
