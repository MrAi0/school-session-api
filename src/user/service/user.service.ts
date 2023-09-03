import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { LoginUserReqDto, LoginUserResDto, RegisterUserReqDto, RegisterUserResDto } from '../model/dto/user.dto';
import { BookSessionReqDto, BookSessionResDto, GetSessionReqDto, GetSessionResDto, GetSessionResponseDtoArray } from '../model/dto/session.dto';
import { RoleEnum } from '@prisma/client';
import { datetime, RRule } from 'rrule'
import { setHours, setMinutes } from 'date-fns'
import { hash, compare } from 'bcrypt';
import { AuthService } from 'src/utils/auth.service';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository, private readonly authService: AuthService) { }

    // Creates a new user
    async registerUser(data: RegisterUserReqDto): Promise<RegisterUserResDto> {
        try {
            let sessionSignature = null;
            if (data.role === RoleEnum.dean) {
                sessionSignature = this.createSessionString();
            }
            data.password = await hash(data.password, 10);
            const userData = await this.userRepository.insertUser(data.fullName, data.userName, data.password, data.role, sessionSignature);
            const response = new RegisterUserResDto();
            response.fullName = userData.fullName;
            response.userName = userData.userName;
            response.universityId = userData.universityId;
            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    // Authenticates the user credentials
    async loginUser(data: LoginUserReqDto): Promise<LoginUserResDto> {
        try {
            const userData = await this.userRepository.getUserByUniId(data.universityId);
            if (!userData) {
                throw new NotFoundException("User with given id not found");
            }
            const isMatch = await compare(data.password, userData.password);
            if (!isMatch) {
                throw new NotFoundException("Incorrect password");
            }
            const response = new LoginUserResDto();
            response.fullName = userData.fullName;
            response.userName = userData.userName;
            response.accessToken = this.authService.generateJwtToken(userData.id, userData.universityId, userData.role);
            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    // Sends the sessions to the user depending on the role
    async getSessions(userId: string, role: RoleEnum, data: GetSessionReqDto): Promise<GetSessionResponseDtoArray> {
        try {
            const userData = await this.userRepository.getUserById(userId);
            if (!userData) {
                throw new NotFoundException("User not found");
            }
            const response = new GetSessionResponseDtoArray();
            switch (role) {
                case 'dean': {
                    const occurrences = this.getDateOccurencesArray(userData.sessionSignature);
                    const userDate = await this.userRepository.getSessions(userId, occurrences, role);
                    response.sessionData = [];
                    if (userDate.length > 0) {
                        for (const elem of userDate) {
                            const resp = new GetSessionResDto()
                            resp.studentId = elem.student.id;
                            resp.studentUniId = elem.student.universityId;
                            resp.fullName = elem.student.fullName;
                            resp.startsAt = elem.startsAt;
                            resp.endsAt = elem.endsAt;
                            response.sessionData.push(resp);
                        }
                    }
                    break;
                }
                case 'student': {
                    if (!data.deanUniversityId) {
                        throw new BadRequestException("Dean university ID not passed")
                    }
                    const deanUserData = await this.userRepository.getUserByUniId(data.deanUniversityId);
                    if (!deanUserData) {
                        throw new NotFoundException("Dean data with university ID not found")
                    }
                    const occurrences = this.getDateOccurencesArray(deanUserData.sessionSignature);
                    const userDate = await this.userRepository.getSessions(deanUserData.id, occurrences, role);
                    if (userDate.length < 1) {
                        const res = this.getDateStartEndStrings(occurrences);
                        response.deanId = deanUserData.id;
                        response.deanUniId = deanUserData.universityId;
                        response.fullName = deanUserData.fullName;
                        response.sessionData = [];
                        for (const elem of res) {
                            const resp = new GetSessionResDto()
                            resp.startsAt = elem.startsAt;
                            resp.endsAt = elem.endsAt;
                            response.sessionData.push(resp);
                        }
                        break;
                    }

                    const filteredDateTimeArray = occurrences.filter(dateTime => {
                        return !userDate.some(obj => obj.startsAt.getTime() === dateTime.getTime());
                    });

                    const res = this.getDateStartEndStrings(filteredDateTimeArray);
                    response.deanId = deanUserData.id;
                    response.deanUniId = deanUserData.universityId;
                    response.fullName = deanUserData.fullName;
                    response.sessionData = [];
                    for (const elem of res) {
                        const resp = new GetSessionResDto();
                        resp.startsAt = elem.startsAt;
                        resp.endsAt = elem.endsAt;
                        response.sessionData.push(resp);
                    }
                    break;
                }
            }
            return response;

        } catch (error) {
            throw new Error(error);
        }
    }

    // Books a session between dean and student
    async bookSession(data: BookSessionReqDto): Promise<BookSessionResDto> {
        try {
            const userData = await this.userRepository.bookSession(data.deanId, data.studentId, data.startsAt, data.endsAt);
            const response = new BookSessionResDto();
            response.deanId = userData.deanId;
            response.studentId = userData.studentId;
            response.startsAt = userData.startsAt;
            response.endsAt = userData.endsAt;
            return response
        } catch (error) {
            throw new Error(error);
        }
    }

    // Creates a session for out example we have given the time slot as 10 am for thursdays and fridays for 4 weeks
    createSessionString(): string {
        const rule = new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            count: 8,
            byweekday: [RRule.TH, RRule.FR],
            dtstart: setMinutes(setHours(new Date(), 10), 0),
            until: datetime(2023, 9, 30)
        });

        return rule.toString();
    }

    // Compute the end time from the given start time and creates and array of objects 
    getDateStartEndStrings(data: Date[]): Array<{ "startsAt": Date, "endsAt": Date }> {
        const response = [];
        for (const elem of data) {
            const responseObj = {};
            responseObj["startsAt"] = elem;
            responseObj["endsAt"] = new Date(elem.getTime() + 60 * 60 * 1000);
            response.push(responseObj);
        }
        return response;
    }

    // Converts the session signature string to dates and removes the past dates from the array
    getDateOccurencesArray(sessionSignature: string): Date[] {
        const rule = RRule.fromString(sessionSignature);
        const occurrences = [];
        for (const elem of rule.all()) {
            if (new Date(elem) > new Date('2023-09-01')) {
                occurrences.push(elem);
            }
        }
        return occurrences;
    }
}
