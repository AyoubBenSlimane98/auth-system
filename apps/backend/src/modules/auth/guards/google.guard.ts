import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '../strategies';

@Injectable()
export class GoogleGuard extends AuthGuard(STRATEGIES.GOOGLE) {}
