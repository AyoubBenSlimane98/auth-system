import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from '@superfaceai/passport-twitter-oauth2';
import { STRATEGIES } from './constants';
import { ConfigService } from '@nestjs/config';
import { TwitterType } from '../../../configuration/types';
import { ProviderEnum } from '../../providers/enums/providers.enum';
import { TwitterTypes } from '../../../common/types';

@Injectable()
export class TwitterStrategy extends PassportStrategy(
  Strategy,
  STRATEGIES.TWITTER,
) {
  constructor(private readonly config: ConfigService) {
    const twitter = config.getOrThrow<TwitterType>('twitter');
    super({
      clientID: twitter.clientID,
      clientSecret: twitter.clientSecret,
      callbackURL: twitter.callback_url,
      clientType: 'confidential',
      scope: ['users.read', 'tweet.read', 'offline.access'],
    });
  }
  validate(_: string, __: string, profile: Profile): TwitterTypes {
    const email = profile.emails?.[0]?.value ?? null;
    if (!email) {
      throw new Error('Twitter account has no email');
    }
    return {
      email,
      provider_user_id: profile.id,
      first_name: profile.name?.givenName || undefined,
      last_name: profile.name?.familyName || undefined,
      avatar_url: profile.photos?.[0]?.value || undefined,
      type: ProviderEnum.TWITTER,
    };
  }
}
