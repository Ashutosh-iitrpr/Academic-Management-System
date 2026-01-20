import { EnrollmentType } from "@prisma/client";
export declare class CreateEnrollmentTriggerDto {
    courseOfferingId: string;
    branchCode: string;
    batchYear: number;
    enrollmentType: EnrollmentType;
}
