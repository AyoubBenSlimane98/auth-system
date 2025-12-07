import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_STRATEGY } from '../constants';
import { Injectable } from '@nestjs/common';
@Injectable()
export class GoogleAuthGuard extends AuthGuard(GOOGLE_STRATEGY) {}
