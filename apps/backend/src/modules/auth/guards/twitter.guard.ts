import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '../strategies';

@Injectable()
export class TwitterGuard extends AuthGuard(STRATEGIES.TWITTER) {}
