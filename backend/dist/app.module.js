"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const courses_module_1 = require("./modules/courses/courses.module");
const course_offerings_module_1 = require("./modules/course-offerings/course-offerings.module");
const enrollments_module_1 = require("./modules/enrollments/enrollments.module");
const student_records_module_1 = require("./modules/student-records/student-records.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const common_module_1 = require("./common/common.module");
const admin_module_1 = require("./modules/admin/admin.module");
const course_proposals_module_1 = require("./modules/course-proposals/course-proposals.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            admin_module_1.AdminModule,
            common_module_1.CommonModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            courses_module_1.CoursesModule,
            course_offerings_module_1.CourseOfferingsModule,
            course_proposals_module_1.CourseProposalsModule,
            enrollments_module_1.EnrollmentsModule,
            student_records_module_1.StudentRecordsModule,
            feedback_module_1.FeedbackModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map