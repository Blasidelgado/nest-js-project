import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}
    async signup(dto: AuthDto){
        // Hash the password
        const hash = await argon.hash(dto.password);

        // Save the new user into db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            })    

            delete user.hash;
    
            return user
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Credentials taken');
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (!user) {
            throw new ForbiddenException('Invalid Credentials');
        }

        const isValidPassword = await argon.verify(user.hash, dto.password)

        if (!isValidPassword) {
            throw new ForbiddenException('Invalid Credentials');
        }

        delete user.hash;

        return user;
    }
}