import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../decorators/isPublic.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  handleLogin(@Req() req) {
    return this.authService.login(req.user._doc);
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
