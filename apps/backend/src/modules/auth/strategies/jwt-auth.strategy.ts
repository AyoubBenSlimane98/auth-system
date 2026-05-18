import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { STRATEGIES } from './constants';
import { ConfigService } from '@nestjs/config';
import { JwtType } from '../../../configuration/types';
import { JwtAuthPayload } from '../../../common/types';
import { cookieExtractor } from '../utils';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  Strategy,
  STRATEGIES.JWT_AUTH,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<JwtType>('jwt').auth.publicKey,
      algorithms: ['RS256'],
    });
  }
  validate(payload: JwtAuthPayload): JwtAuthPayload {
    return payload;
  }
}
