import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../decorators/isPublic.decorator';
import { ResponseMessage } from '../decorators/message.decorator';
import { LoginUserDto, RegisterUserDto } from '../users/dto/create-user.dto';
import { IUser } from '../users/users.interface';
import { Response, Request } from 'express';
import { User } from '../decorators/user.decorator';
import { RolesService } from '../roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ResponseMessage('User login')
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  async handleLogin(
    @Req() req: Request & { user: IUser },
    @Res({ passthrough: true }) response: Response,
    @Body() body: LoginUserDto,
  ) {
    return await this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @ResponseMessage('Get user information')
  @Get('account')
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.roleService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  @Public()
  @ResponseMessage('Get user by refresh token')
  @Get('refresh')
  async handleRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(req.cookies.refresh_token, response);
  }

  @ResponseMessage('Logout user')
  @Post('logout')
  async handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(response, user);
  }
}
