import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCode } from '../entities/user-code.entity';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class UserCodeService {
  constructor(
    @InjectRepository(UserCode)
    private userCodeRepository: Repository<UserCode>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>
  ) {}

  async generateUserCode(userId: string): Promise<UserCode> {
    // Deactivate existing codes
    await this.userCodeRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );

    // Generate new unique code
    let code = this.generateRandomCode();
    let isUnique = false;
    
    while (!isUnique) {
      const existingCode = await this.userCodeRepository.findOne({ 
        where: { code, isActive: true } 
      });
      if (!existingCode) {
        isUnique = true;
      } else {
        code = this.generateRandomCode();
      }
    }

    const userCode = this.userCodeRepository.create({
      userId,
      code,
      isActive: true
    });

    return await this.userCodeRepository.save(userCode);
  }

  async findUserByCode(code: string): Promise<UserProfile | null> {
    const userCode = await this.userCodeRepository.findOne({
      where: { code, isActive: true }
    });

    if (!userCode) {
      return null;
    }

    const userProfile = await this.userProfileRepository.findOne({
      where: { id: userCode.userId }
    });

    return userProfile;
  }

  async getUserCode(userId: string): Promise<UserCode | null> {
    return await this.userCodeRepository.findOne({
      where: { userId, isActive: true }
    });
  }

  private generateRandomCode(): string {
    const prefix = 'TRV';
    const numbers = Math.floor(100000 + Math.random() * 900000).toString();
    return `${prefix}${numbers}`;
  }
}