import { RoleEnum } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class RegisterUserReqDto {

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    userName: string;


    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsEnum(RoleEnum)
    role: RoleEnum;
}

export class RegisterUserResDto {

    fullName: string;

    userName: string;

    universityId: string;

}

export class LoginUserReqDto {

    @IsNotEmpty()
    @IsString()
    universityId: string;


    @IsNotEmpty()
    @IsString()
    password: string;
}

export class LoginUserResDto {

    fullName: string;

    userName: string;

    accessToken: string;
}
