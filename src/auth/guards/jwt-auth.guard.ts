import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  IS_PUBLIC_PERMISSION,
} from '../../decorators/isPublic.decorator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const isSkipPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION,
      [context.getHandler(), context.getClass()],
    );
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Token is invalid or not provided')
      );
    }

    //check permissions
    const targetMethod = request.method;
    const targetEndpoint = request.route.path as string;
    const permissions = user?.permissions ?? [];
    let isExist = permissions.find(
      (permissions: { apiPath: any; method: string }) => {
        return (
          permissions.apiPath === targetEndpoint &&
          permissions.method === targetMethod
        );
      },
    );

    if (targetEndpoint.startsWith('/api/v1/auth')) isExist = true;
    if (!isExist && !isSkipPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return user;
  }
}
