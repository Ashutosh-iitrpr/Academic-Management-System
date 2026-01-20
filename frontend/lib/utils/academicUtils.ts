import dayjs from 'dayjs';
import type { AcademicCalendar } from '@/lib/types';

export const MIN_CREDITS_PER_SEM = 12;
export const MAX_CREDITS_PER_SEM = 24;

export const isEnrollmentOpen = (calendar: AcademicCalendar): boolean => {
  const now = dayjs();
  const start = dayjs(calendar.enrollmentStart);
  const end = dayjs(calendar.enrollmentEnd);
  return now.isAfter(start) && now.isBefore(end);
};

export const isDropDeadlinePassed = (calendar: AcademicCalendar): boolean => {
  const now = dayjs();
  const deadline = dayjs(calendar.dropDeadline);
  return now.isAfter(deadline);
};

export const isAuditDeadlinePassed = (calendar: AcademicCalendar): boolean => {
  const now = dayjs();
  const deadline = dayjs(calendar.auditDeadline);
  return now.isAfter(deadline);
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  return deadlineDate.diff(now, 'day');
};

export const formatDate = (date: string): string => {
  return dayjs(date).format('DD MMM YYYY');
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

export const extractBranchFromEntryNumber = (entryNumber: string): string => {
  // Format: 2023CSB1234 -> CSB
  const match = entryNumber.match(/\d{4}([A-Z]+)\d+/);
  return match ? match[1] : '';
};

export const canEnrollInOffering = (
  userBranch: string,
  offeringBranches: string[]
): boolean => {
  return offeringBranches.includes(userBranch);
};

export const validateCredits = (
  currentCredits: number,
  newCredits: number,
  isDropping: boolean = false
): { isValid: boolean; message?: string } => {
  const totalCredits = isDropping ? currentCredits - newCredits : currentCredits + newCredits;

  if (totalCredits < MIN_CREDITS_PER_SEM) {
    return {
      isValid: false,
      message: `Total credits cannot be less than ${MIN_CREDITS_PER_SEM}. Current: ${totalCredits}`,
    };
  }

  if (totalCredits > MAX_CREDITS_PER_SEM) {
    return {
      isValid: false,
      message: `Total credits cannot exceed ${MAX_CREDITS_PER_SEM}. Current: ${totalCredits}`,
    };
  }

  return { isValid: true };
};
