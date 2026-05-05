import { Module } from '@nestjs/common';
import { SessionsRepository } from './repository/sessions.repository';

@Module({
  providers: [SessionsRepository],
  exports: [SessionsRepository],
})
export class SessionsModule {}
