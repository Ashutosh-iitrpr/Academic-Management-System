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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const otp_util_1 = require("../../utils/otp.util");
const mail_util_1 = require("../../utils/mail.util");
const email_service_1 = require("../../common/services/email.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwtService;
    emailService;
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async requestOtp(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException("Account is deactivated");
        }
        const otp = (0, otp_util_1.generateOtp)();
        const otpHash = (0, otp_util_1.hashOtp)(otp);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.otpToken.create({
            data: {
                userId: user.id,
                otpHash,
                expiresAt,
            },
        });
        await (0, mail_util_1.sendOtpEmail)(user.email, otp, this.emailService, user.name);
        return {
            message: "OTP sent to registered email",
        };
    }
    async verifyOtp(email, otp) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException("Account is deactivated");
        }
        const latestOtp = await this.prisma.otpToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });
        if (!latestOtp) {
            throw new common_1.UnauthorizedException("OTP not requested");
        }
        if (latestOtp.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException("OTP expired");
        }
        const incomingOtpHash = (0, otp_util_1.hashOtp)(otp);
        if (incomingOtpHash !== latestOtp.otpHash) {
            throw new common_1.UnauthorizedException("Invalid OTP");
        }
        await this.prisma.otpToken.delete({
            where: { id: latestOtp.id },
        });
        const accessToken = this.jwtService.sign({
            sub: user.id,
            role: user.role,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                entryNumber: user.entryNumber,
                department: user.department,
                isFacultyAdvisor: user.isFacultyAdvisor,
            },
        };
    }
    async getCurrentUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        let branch = null;
        if (user.role === "STUDENT" && user.entryNumber) {
            branch = user.entryNumber.substring(4, 7);
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            entryNumber: user.entryNumber,
            department: user.department,
            branch: branch,
            isFacultyAdvisor: user.isFacultyAdvisor,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map