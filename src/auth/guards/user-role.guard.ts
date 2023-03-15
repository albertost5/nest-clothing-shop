import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  private readonly logger = new Logger(UserRoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log('UseRoleGuard start...');

    const validRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    this.logger.log(`Valid roles: ${ JSON.stringify(validRoles) }`);

    if (!validRoles || validRoles.length === 0) return true;

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
