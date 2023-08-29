import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { PrismaService } from 'src/db/prisma.service';
import { AuthService } from 'src/utils/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET,
      signOptions: { expiresIn: '1h' }
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, AuthService],
})
export class UserModule { }
