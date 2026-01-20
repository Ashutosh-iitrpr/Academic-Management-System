import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo() {
    return {
      message: 'Academic Management System API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        admin: '/api/admin',
        auth: '/api/auth',
        courses: '/api/courses',
        student: '/api/student',
        instructor: '/api/instructor',
      },
    };
  }
}
