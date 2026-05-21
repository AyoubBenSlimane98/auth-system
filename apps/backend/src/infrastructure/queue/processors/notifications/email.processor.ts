import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../../constants';
import { SendGridService } from './sendgrid.service';
import { LoggerService } from '../../../logs/logger.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private context = EmailProcessor.name;
  constructor(
    private readonly sendgridService: SendGridService,
    private readonly logger: LoggerService,
  ) {
    super();
  }
  async process(job: Job) {
    const startedAt = Date.now();
    const { email, token } = job.data as { email: string; token: string };
    this.logger.log(this.context, 'job started', {
      jobId: job.id,
      jobName: job.name,
      email,
    });

    try {
      switch (job.name) {
        case 'verify-email':
          await this.sendgridService.sendEmailVerifyAccount(email, token);
          this.logger.log(this.context, 'verify-email send', {
            jobId: job.id,
          });
          break;

        case 'reset-password':
          await this.sendgridService.sendEmailResetPassword(email, token);
          this.logger.log(this.context, 'reset password send', {
            jobId: job.id,
          });
          break;
        default:
          this.logger.logWarn(this.context, 'unknown job type', {
            jobId: job.id,
            jobName: job.name,
          });
          return;
      }
      const durationMs = Date.now() - startedAt;
      this.logger.log(this.context, 'job completed', {
        jobId: job.id,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      this.logger.logError(this.context, 'job failed', err, {
        jobId: job.id,
        jobName: job.name,
        durationMs,
      });
      throw err;
    }
  }
}
