import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../users/users.interface';
import { RegisterUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService
      .findOneByUserName(username)
      .select('+password');

    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);

      if (isValid) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        return {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
      }
    }

    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken(payload);

    await this.usersService.updateUserToken(refreshToken, _id);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }

  createRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')) / 1000,
    });
  }

  async refreshToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByRefreshToken(refreshToken);

      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token login',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refreshToken = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refreshToken, _id.toString());

        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);

        response.clearCookie('refresh_token');

        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          maxAge: ms(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE'),
          ),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      }
    } catch (error) {
      throw new BadRequestException(
        'Invalid refresh token, please login again',
      );
    }
  }

  async logout(response: Response, user: IUser) {
    await this.usersService.updateUserToken(null, user._id);
    response.clearCookie('refresh_token');
    return 'Logout success';
  }
}
