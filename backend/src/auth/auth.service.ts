import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    // REGISTER 
    async register(dto: RegisterDto){
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }],
            },
        });

        if (existing) {
            throw new ConflictException('Email or username already taken');
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                name: dto.name,
                username: dto.username,
            },
        });

        const { password, ...result } = user;
        return result;
    };

    async login(dto: LoginDto){
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });

        if(!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        if(!user.isActive) {
            throw new UnauthorizedException('Account is banned');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        const { password, ...result} = user;

        return { user: result, token };
    }
}
