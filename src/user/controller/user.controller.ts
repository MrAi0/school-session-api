import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { LoginUserReqDto, LoginUserResDto, RegisterUserReqDto, RegisterUserResDto } from '../model/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { BookSessionReqDto, BookSessionResDto, GetSessionReqDto, GetSessionResponseDtoArray } from '../model/dto/session.dto';

@Controller('user/')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  @HttpCode(201)
  registerUser(@Body(new ValidationPipe({ transform: true })) body: RegisterUserReqDto): Promise<RegisterUserResDto> {
    return this.userService.registerUser(body);
  }

  @Post('login')
  @HttpCode(200)
  loginUser(@Body(new ValidationPipe({ transform: true })) body: LoginUserReqDto): Promise<LoginUserResDto> {
    return this.userService.loginUser(body);
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  getSessions(@Req() request, @Query(new ValidationPipe({ transform: true })) qParams: GetSessionReqDto): Promise<GetSessionResponseDtoArray> {
    return this.userService.getSessions(request.user.userId, request.user.role, qParams);
  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  bookSession(@Body(new ValidationPipe({ transform: true })) body: BookSessionReqDto): Promise<BookSessionResDto> {
    return this.userService.bookSession(body);
  }
}
