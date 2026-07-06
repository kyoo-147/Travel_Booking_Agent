import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // For development, allow all requests
    // In production, implement proper JWT validation
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    // Extract token and validate (simplified for development)
    const token = authHeader.substring(7);
    
    // TODO: Implement proper JWT validation
    // For now, accept any non-empty token
    return token.length > 0;
  }
}