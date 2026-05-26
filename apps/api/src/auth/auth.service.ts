import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const dateOfBirth = new Date(dto.dateOfBirth);

    if (!this.isAllowedAge(dateOfBirth)) {
      throw new BadRequestException(
        "La beta publica solo permite usuarios mayores de edad"
      );
    }

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException(
        "No se puede crear una cuenta administradora desde el registro publico"
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          fullName: dto.fullName,
          dateOfBirth,
          passwordHash,
          primaryRole: dto.role ?? UserRole.PLAYER
        }
      });

      return this.createSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("El email ya esta registrado");
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    return this.createSession(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        playerProfile: true,
        clubMemberships: {
          include: {
            club: true
          }
        }
      }
    });

    return this.toPublicUser(user);
  }

  private async createSession(user: User) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.primaryRole
    });

    return {
      accessToken,
      user: this.toPublicUser(user)
    };
  }

  private toPublicUser(user: User | Record<string, unknown>) {
    const { passwordHash: _passwordHash, ...publicUser } = user as User;
    return publicUser;
  }

  private isAllowedAge(dateOfBirth: Date) {
    const allowMinorPlayers =
      this.configService.get<string>("ALLOW_MINOR_PLAYERS", "false") ===
      "true";
    const minimumAge = Number(
      this.configService.get<string>("MIN_PLAYER_AGE", "18")
    );
    const requiredAge = allowMinorPlayers ? minimumAge : 18;
    return this.getAge(dateOfBirth) >= requiredAge;
  }

  private getAge(dateOfBirth: Date) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() &&
        today.getDate() >= dateOfBirth.getDate());

    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    return age;
  }
}
