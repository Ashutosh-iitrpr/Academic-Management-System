"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEnrollmentTriggerDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateEnrollmentTriggerDto {
    courseOfferingId;
    branchCode;
    batchYear;
    enrollmentType;
}
exports.CreateEnrollmentTriggerDto = CreateEnrollmentTriggerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEnrollmentTriggerDto.prototype, "courseOfferingId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z]{3}$/, {
        message: "Branch code must be 3 uppercase letters",
    }),
    __metadata("design:type", String)
], CreateEnrollmentTriggerDto.prototype, "branchCode", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateEnrollmentTriggerDto.prototype, "batchYear", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.EnrollmentType),
    __metadata("design:type", String)
], CreateEnrollmentTriggerDto.prototype, "enrollmentType", void 0);
//# sourceMappingURL=create-enrollment-trigger.dto.js.map