import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al iniciar sesión');
    }
  }
}
