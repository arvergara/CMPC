import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Check if planta exists if provided
    if (registerDto.plantaId) {
      const planta = await this.prisma.planta.findUnique({
        where: { id: registerDto.plantaId },
      });

      if (!planta) {
        throw new ConflictException('La planta especificada no existe');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        nombre: registerDto.nombre,
        rol: registerDto.rol || 'INVESTIGADOR',
        plantaId: registerDto.plantaId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.generateToken(user.id, user.email, user.rol);

    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generate JWT token
    const token = await this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        plantaId: user.plantaId,
        isActive: user.isActive,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        plantaId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        planta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            ubicacion: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  private async generateToken(
    userId: string,
    email: string,
    rol: string,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      rol,
    };

    return this.jwtService.sign(payload);
  }
}
