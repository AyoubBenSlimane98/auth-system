import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../../constants';
import { SendGridService } from './sendgrid.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  constructor(private readonly sendgridService: SendGridService) {
    super();
  }
  async process(job: Job) {
    const { email, token } = job.data as { email: string; token: string };
    switch (job.name) {
      case 'verify-email':
        await this.sendgridService.sendEmailVerifyAccount(email, token);
        break;

      case 'reset-password':
        await this.sendgridService.sendEmailResetPassword(email, token);
        break;
    }
  }
}
