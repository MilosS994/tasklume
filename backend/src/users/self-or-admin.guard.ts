import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { Observable } from 'rxjs/internal/Observable';
import { Request } from 'express';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const user = request.user;
    const targetId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'admin' || user.sub === targetId) {
      return true;
    }

    throw new ForbiddenException('You can only modify your own account');
  }
}
