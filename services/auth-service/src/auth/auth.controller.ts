import { Controller, Post, Body, Get, UseGuards, Request, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  async getProfile(@Request() req: any) {
    // Now we get the user from JWT token validation
    const userId = req.user.id;
    return this.authService.getProfile(userId);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user by ID (for internal services)' })
  async getUserById(@Param('id') userId: string, @Headers('x-user-id') requestingUserId?: string) {
    // Internal service call - check if it's from user-service by header
    if (requestingUserId) {
      return this.authService.getProfile(userId);
    }
    return { message: 'Access denied' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: { refreshToken?: string }) {
    // Simple refresh token implementation for testing
    // In production, this should validate the refresh token
    return { 
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };
  }
}