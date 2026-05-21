import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '@modules/auth/strategies';

@Injectable()
export class GoogleGuard extends AuthGuard(STRATEGIES.GOOGLE) {}
