import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getApiInfo(): {
        message: string;
        version: string;
        status: string;
        endpoints: {
            admin: string;
            auth: string;
            courses: string;
            student: string;
            instructor: string;
        };
    };
}
