import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/repository/users.repository';
import { ProvidersRepository } from '@modules/providers/repository/providers.repository';
import { AppException } from '@common/filters';
import { ErrorCode } from '@common/enums';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly providersRepo: ProvidersRepository,
  ) {}
  async getUserProfile(sub: string) {
    const provider = await this.providersRepo.findById(sub);
    if (!provider) {
      throw new AppException({
        message: 'User profile not found',
        code: ErrorCode.PROFILE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const user = await this.usersRepo.findById(provider.user_id);

    if (!user) {
      throw new AppException({
        message: 'User profile not found',
        code: ErrorCode.PROFILE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return {
      message: 'Profile fetched successfully',
      data: {
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
    };
  }
}
