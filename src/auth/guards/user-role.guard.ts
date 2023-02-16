import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('UseRoleGuard start...');

    const validRoles: string[] = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
      
    if ( validRoles.length === 0 || !validRoles ) return true;

    const req: Express.Request = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new NotFoundException('User not found.');

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `The user ${user.fullName.toLocaleUpperCase()} should have a valid role: ${validRoles}.`,
    );
  }
}
