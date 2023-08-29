import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    generateJwtToken(userId: string, universityId: string, role: RoleEnum): string {
        const payload = { userId: userId, universityId: universityId, role: role };
        return this.jwtService.sign(payload);
    }
}