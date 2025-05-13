import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  constructor(context: string) {
    super(context);
  }
  error(message: any, trace?: string, context?: string) {
    super.error(message, null, context);
  }
}
