import { Controller, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards';
@UseGuards(GoogleAuthGuard)
@Controller('google-auth')
export class GoogleAuthController {}
