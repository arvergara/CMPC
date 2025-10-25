import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs', 302)
  root() {
    return;
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CMPC LIMS Backend',
      version: '1.0.0',
    };
  }
}
