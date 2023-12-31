import { IsNotEmpty, IsString, IsDateString, IsOptional } from "class-validator";

export class InsertSessionDto {

    @IsDateString()
    @IsNotEmpty()
    startsAt: Date;

    @IsDateString()
    @IsNotEmpty()
    endsAt: Date;

}

export class GetSessionReqDto {
    @IsOptional()
    @IsString()
    deanUniversityId?: string;
}

export class GetSessionResponseDtoArray {
    deanId?: string;

    deanUniId?: string;

    fullName: string;

    sessionData: GetSessionResDto[]
}

export class GetSessionResDto {

    studentId?: string;

    studentUniId?: string;

    fullName: string;

    startsAt: Date;

    endsAt: Date;
}

export class BookSessionReqDto {

    @IsNotEmpty()
    @IsString()
    deanId: string;

    @IsNotEmpty()
    @IsString()
    studentId: string;

    @IsNotEmpty()
    startsAt: Date;

    @IsNotEmpty()
    endsAt: Date;
}


export class BookSessionResDto {

    deanId: string;

    studentId: string;

    startsAt: Date;

    endsAt: Date;
}



