import { Module } from "@nestjs/common";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseOfferingsModule } from './modules/course-offerings/course-offerings.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { StudentRecordsModule } from "./modules/student-records/student-records.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { CommonModule } from "./common/common.module"
import { AdminModule } from "./modules/admin/admin.module";
@Module({
  imports: [AdminModule, CommonModule, UsersModule, AuthModule, CoursesModule, CourseOfferingsModule, EnrollmentsModule, StudentRecordsModule, FeedbackModule],
})
export class AppModule {}
