import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

export interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  phone: string;
  dateOfBirth: Date;
  preferences: {
    currency: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SimpleTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SimpleAuthResponse {
  user: SimpleUser;
  tokens: SimpleTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<SimpleAuthResponse> {
    const user = await this.usersService.create(registerDto);
    
    return {
      user: this.transformUser(user),
      tokens: this.generateSimpleTokens(user),
    };
  }

  async login(loginDto: LoginDto): Promise<SimpleAuthResponse> {
    const { email, password } = loginDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: this.transformUser(user),
      tokens: this.generateSimpleTokens(user),
    };
  }

  async getProfile(userId: string): Promise<SimpleUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.transformUser(user);
  }

  private transformUser(user: User): SimpleUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '',
      isEmailVerified: user.emailVerified,
      phone: '',
      dateOfBirth: new Date(),
      preferences: {
        currency: 'USD',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateSimpleTokens(user: User): SimpleTokens {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }
}