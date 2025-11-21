/**
 * Permission utilities for role-based access control
 * Based on BA_PM_Quan_ly_Du_an_dich_thuat.md
 */

export type UserRole =
  | 'chu_nhiem'
  | 'pho_chu_nhiem'
  | 'truong_ban_thu_ky'
  | 'thu_ky_hop_phan'
  | 'van_phong'
  | 'ke_toan'
  | 'van_thu'
  | 'bien_tap_vien'
  | 'ky_thuat_vien'
  | 'dich_gia'
  | 'chuyen_gia'
  | 'phu_trach_nhan_su';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole | string; // Allow string for flexibility
  is_superuser?: boolean;
  is_staff?: boolean;
}

/**
 * Check if user can create works
 * Allowed: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký, Thư ký hợp phần
 */
export function canCreateWork(user: User | null): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'thu_ky_hop_phan',
  ];
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can edit work
 * Allowed: 
 * - Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký, Thư ký hợp phần: Edit all
 * - Dịch giả: Only edit works assigned to them
 */
export function canEditWork(user: User | null, work?: { translator_id?: number }): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const adminRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'thu_ky_hop_phan',
  ];
  
  // Admin roles can edit all
  if (adminRoles.includes(user.role)) return true;
  
  // Dịch giả can only edit their own works
  if (user.role === 'dich_gia' && work) {
    return work.translator_id === user.id;
  }
  
  return false;
}

/**
 * Check if user can delete work
 * Allowed: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký
 */
export function canDeleteWork(user: User | null): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
  ];
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can approve work
 * Allowed: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký
 */
export function canApproveWork(user: User | null): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
  ];
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can assign translator
 * Allowed: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký, Thư ký hợp phần
 */
export function canAssignTranslator(user: User | null): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'thu_ky_hop_phan',
  ];
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can view all works
 * Allowed: All authenticated users
 */
export function canViewWorks(user: User | null): boolean {
  return user !== null;
}

/**
 * Check if user can update translation progress
 * Allowed: Dịch giả (for their own works), Admin roles
 */
export function canUpdateProgress(user: User | null, work?: { translator_id?: number }): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const adminRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'thu_ky_hop_phan',
  ];
  
  if (adminRoles.includes(user.role)) return true;
  
  // Dịch giả can update progress for their own works
  if (user.role === 'dich_gia' && work) {
    return work.translator_id === user.id;
  }
  
  return false;
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    chu_nhiem: 'Chủ nhiệm',
    pho_chu_nhiem: 'Phó Chủ nhiệm',
    truong_ban_thu_ky: 'Trưởng ban Thư ký',
    thu_ky_hop_phan: 'Thư ký hợp phần',
    van_phong: 'Văn phòng',
    ke_toan: 'Kế toán',
    van_thu: 'Văn thư',
    bien_tap_vien: 'Biên tập viên',
    ky_thuat_vien: 'Kỹ thuật viên',
    dich_gia: 'Dịch giả',
    chuyen_gia: 'Chuyên gia',
    phu_trach_nhan_su: 'Phụ trách Nhân sự',
  };
  
  return roleMap[role] || role;
}

/**
 * Check if user is admin (can manage users)
 * Admin (is_superuser) has highest priority, then Admin roles: chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  // Admin (is_superuser) has highest priority - always return true first
  if (user.is_superuser) return true;
  
  const adminRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
  ];
  
  return adminRoles.includes(user.role);
}

/**
 * Check if user can create users
 * Only admin can create users
 */
export function canCreateUser(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can edit a specific user
 * Admin can edit all, regular users can only edit themselves
 */
export function canEditUser(user: User | null, targetUserId?: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  
  // Regular users can only edit themselves
  return targetUserId === user.id;
}

/**
 * Check if user can activate/deactivate users
 * Only admin can activate/deactivate users
 */
export function canManageUserStatus(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can view full user information
 * Admin can see all full info, regular users can see their own full info
 */
export function canViewFullUserInfo(user: User | null, targetUserId?: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  
  // Regular users can see their own full info
  return targetUserId === user.id;
}

/**
 * Check if user can manage users (admin panel)
 * Allowed: Admin (is_superuser) has highest priority, then Admin roles (chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky) and phu_trach_nhan_su
 */
export function canManageUsers(user: User | null): boolean {
  if (!user) return false;
  // Admin (is_superuser) has highest priority - always return true first
  if (user.is_superuser) return true;

  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'phu_trach_nhan_su',
  ];

  return allowedRoles.includes(user.role);
}

/**
 * Check if user can manage translators
 * Allowed: Admin (is_superuser) has highest priority, then Admin roles (chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky) and thu_ky_hop_phan
 */
export function canManageTranslators(user: User | null): boolean {
  if (!user) return false;
  // Admin (is_superuser) has highest priority - always return true first
  if (user.is_superuser) return true;

  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'pho_chu_nhiem',
    'truong_ban_thu_ky',
    'thu_ky_hop_phan',
  ];

  return allowedRoles.includes(user.role);
}

/**
 * Check if user can access work reports
 * Allowed: Admin, Chủ nhiệm, Trưởng ban Thư ký, Kế toán, Thư ký hợp phần, Biên tập viên, Văn phòng
 */
export function canAccessWorkReports(user: User | null): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const allowedRoles: UserRole[] = [
    'chu_nhiem',
    'truong_ban_thu_ky',
    'ke_toan',
    'thu_ky_hop_phan',
    'bien_tap_vien',
    'van_phong',
  ];
  
  return allowedRoles.includes(user.role);
}

