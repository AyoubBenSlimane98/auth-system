import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { STRATEGIES } from './constants';
import { ConfigService } from '@nestjs/config';
import { GoogleType } from '../../../configuration/types';
import { ProviderEnum } from '../../providers/enums/providers.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  STRATEGIES.GOOGLE,
) {
  constructor(private readonly config: ConfigService) {
    const google = config.getOrThrow<GoogleType>('google');
    super({
      clientID: google.clientID,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackURL,
      scope: ['email', 'profile'],
    });
  }
  validate(_: string, __: string, profile: Profile) {
    const email = profile.emails?.[0]?.value ?? null;
    if (!email) {
      throw new Error('Google account has no email');
    }
    console.log({
      email,
      provider_user_id: profile.id,
      first_name: profile.name?.givenName,
      last_name: profile.name?.familyName,
      avatar_url: profile.photos?.[0]?.value,
      type: ProviderEnum.GOOGLE,
    });
    return {
      email,
      provider_user_id: profile.id,
      first_name: profile.name?.givenName,
      last_name: profile.name?.familyName,
      avatar_url: profile.photos?.[0]?.value,
      type: ProviderEnum.GOOGLE,
    };
  }
}
