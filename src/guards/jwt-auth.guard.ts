import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        // Attach user info to the request
        request.user = decoded;
        return request;
      } catch (err) {
        // Token is invalid or expired
        return false;
      }
    }
    // No token provided
    return false;
  }
}
