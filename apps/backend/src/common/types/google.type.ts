import { ProviderEnum } from '../../modules/providers/enums/providers.enum';

export type GoogleTypes = {
  email: string;
  provider_user_id: string;
  first_name: string | undefined;
  last_name: string | undefined;
  avatar_url: string | undefined;
  type: ProviderEnum;
};
