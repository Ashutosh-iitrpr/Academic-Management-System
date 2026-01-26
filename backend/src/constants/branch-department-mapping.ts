/**
 * Branch to Department Mapping
 * Maps student entry number branches (3 characters) to advisor departments
 */
export const BRANCH_DEPARTMENT_MAPPING: Record<string, string> = {
  // Computer Science
  'CSB': 'Computer Science',
  'CS': 'Computer Science',

  // Electrical Engineering
  'ECB': 'Electrical Engineering',
  'ECE': 'Electrical Engineering',
  'ECC': 'Electrical Engineering',

  // Mechanical Engineering
  'MEB': 'Mechanical Engineering',
  'MEC': 'Mechanical Engineering',

  // Civil Engineering
  'CIB': 'Civil Engineering',
  'CIC': 'Civil Engineering',

  // Chemical Engineering
  'CHB': 'Chemical Engineering',
  'CHC': 'Chemical Engineering',

  // Physics
  'PHB': 'Physics',
  'PHC': 'Physics',

  // Chemistry
  'CYB': 'Chemistry',
  'CYC': 'Chemistry',

  // Mathematics
  'MAB': 'Mathematics',
  'MAC': 'Mathematics',
};

/**
 * Get the department for a given branch code
 * @param branchCode - 3-character branch code from entry number
 * @returns Department name or null if not found
 */
export function getBranchDepartment(branchCode: string): string | null {
  return BRANCH_DEPARTMENT_MAPPING[branchCode.toUpperCase()] || null;
}

/**
 * Check if advisor department matches student branch
 * @param advisorDepartment - Department of the advisor
 * @param studentBranch - 3-character branch code from student's entry number
 * @returns true if departments match
 */
export function isDepartmentBranchMatch(
  advisorDepartment: string,
  studentBranch: string,
): boolean {
  const normalizedAdvisorDept = advisorDepartment.trim().toLowerCase();
  const studentDept = getBranchDepartment(studentBranch.trim().toUpperCase());
  
  if (!studentDept) {
    return false;
  }

  return studentDept.toLowerCase() === normalizedAdvisorDept;
}
