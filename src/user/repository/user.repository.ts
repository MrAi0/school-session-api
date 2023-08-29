import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { RoleEnum, Session, User } from "@prisma/client";

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) { }

    async insertUser(fullName: string, userName: string, password: string, role: RoleEnum, sessionSignature?: string): Promise<User> {
        return await this.prisma.user.create({
            data: {
                fullName: fullName,
                userName: userName,
                password: password,
                role: role,
                sessionSignature: sessionSignature,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    }

    async getUserByUniId(universityId: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                universityId: universityId,
            }
        });
    }

    async getUserById(id: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                id: id,
            }
        });
    }

    async getSessions(deanId: string, dates: Date[], role: RoleEnum) {
        return await this.prisma.session.findMany({
            include: {
                student: role === RoleEnum.dean ? true : false
            },
            where: {
                deanId: deanId,
                startsAt: {
                    in: dates
                }
            }
        });
    }

    async bookSession(deanId: string, studentId: string, startsAt: Date, endsAt: Date): Promise<Session> {
        return await this.prisma.session.create({
            data: {
                deanId: deanId,
                studentId: studentId,
                startsAt: startsAt,
                endsAt: endsAt,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    }
}