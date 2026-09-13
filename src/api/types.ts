export interface PagedResult<T> { items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number }

export interface UserProfile {
  id: string; username: string; email: string; fullName: string; avatarUrl?: string;
  roleName: string; permissions: string[]; preferredLanguage: string; preferredTheme: string; twoFactorEnabled: boolean
}

export interface EmployeeListItem {
  id: string; employeeCode: string; fullName: string; photoUrl?: string; departmentName?: string;
  positionTitle?: string; employmentStatus: string; email?: string; phoneNumber?: string; hireDate: string
}
export interface EmployeeDetail extends EmployeeListItem {
  firstName: string; lastName: string; middleName?: string; dateOfBirth?: string; gender?: string;
  address?: string; departmentId?: string; positionId?: string; contractType?: string;
  salaryAmount?: number; salaryCurrency: string; passportNumber?: string;
  emergencyContactName?: string; emergencyContactPhone?: string; notes?: string;
  createdAt: string; updatedAt: string; customFields: Record<string, string | null>
}

export interface StudentListItem {
  id: string; studentCode: string; fullName: string; photoUrl?: string; className?: string;
  studentStatus: string; enrollmentDate: string; dateOfBirth?: string
}
export interface ParentSummary { id: string; fullName: string; relationship: string; phoneNumber: string; isPrimaryContact: boolean }
export interface StudentDetail extends StudentListItem {
  firstName: string; lastName: string; middleName?: string; gender?: string; classSectionId?: string;
  graduationDate?: string; address?: string; medicalNotes?: string; notes?: string;
  createdAt: string; updatedAt: string; parents: ParentSummary[]; customFields: Record<string, string | null>
}

export interface ParentListItem { id: string; parentCode: string; fullName: string; photoUrl?: string; phoneNumber: string; email?: string; childrenCount: number }
export interface StudentSummary { id: string; fullName: string; className?: string; relationship: string; canPickup: boolean }
export interface ParentDetail extends ParentListItem {
  firstName: string; lastName: string; secondaryPhone?: string; address?: string; occupation?: string;
  workplace?: string; notes?: string; createdAt: string; updatedAt: string; children: StudentSummary[]
}

export interface AttendanceEvent {
  id: string; ownerType: string; ownerId: string; ownerName: string; eventType: string;
  eventTimestamp: string; source: string; deviceName?: string; recordedByName?: string
}
export interface AttendanceStats { presentToday: number; absentToday: number; lateToday: number; attendanceRatePercent: number }
export interface DailySummary {
  ownerId: string; ownerName: string; ownerType: string; date: string;
  firstEntry?: string; lastExit?: string; totalMinutesPresent?: number; status: string
}

export interface DashboardStats {
  totalEmployees: number; totalStudents: number; totalParents: number;
  activeEmployees: number; activeStudents: number; todayAttendance: AttendanceStats;
  attendanceTrend: { date: string; presentCount: number; absentCount: number }[]
}

export interface TurnstileDevice { id: string; deviceCode: string; name: string; location: string; directionMode: string; isOnline: boolean; lastHeartbeatAt?: string }
export interface RfidCard { id: string; cardUid: string; ownerType: string; ownerId: string; ownerName: string; status: string; issuedAt: string }

export interface RoleDto { id: string; name: string; description?: string; isSystem: boolean; permissions: string[] }
export interface UserAdminListItem { id: string; username: string; email: string; fullName: string; roleName: string; isActive: boolean; lastLoginAt?: string }

export interface AuditLogEntry { id: number; userId?: string; userDisplay?: string; action: string; entityType: string; entityId?: string; beforeJson?: string; afterJson?: string; ipAddress?: string; createdAt: string }
