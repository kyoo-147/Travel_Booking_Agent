import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { email, password, firstName, lastName } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { facebookId } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await this.usersRepository.update(userId, { passwordHash });
  }

  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    // const expiry = new Date();
    // expiry.setHours(expiry.getHours() + 1); // 1 hour expiry
    
    // await this.usersRepository.update(userId, {
    //   passwordResetToken: token,
    //   passwordResetExpires: expiry,
    // });
    
    // Temporarily disabled due to schema mismatch
    console.log(`Password reset token for user ${userId}: ${token}`);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerified: true,
      // emailVerificationToken: undefined,
    });
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await this.usersRepository.update(userId, { googleId });
  }

  async linkFacebookAccount(userId: string, facebookId: string): Promise<void> {
    await this.usersRepository.update(userId, { facebookId });
  }
}