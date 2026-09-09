/**
 * Role-Based Access Control (RBAC) Permissions Utility
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */
import { UserRole } from '../types';

export interface RolePermissions {
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canDeleteTransactions: boolean;
  canCreateExpenses: boolean;
  canReceiveMoney: boolean;
  canManageProjects: boolean;
  canManageContractors: boolean;
  canManageSuppliers: boolean;
  canManageLoans: boolean;
  canManageMonthlyBills: boolean;
  canViewReports: boolean;
  canPrintVouchers: boolean;
  canViewLedger: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    canManageUsers: true,
    canViewAuditLogs: true,
    canDeleteTransactions: true,
    canCreateExpenses: true,
    canReceiveMoney: true,
    canManageProjects: true,
    canManageContractors: true,
    canManageSuppliers: true,
    canManageLoans: true,
    canManageMonthlyBills: true,
    canViewReports: true,
    canPrintVouchers: true,
    canViewLedger: true,
    canManageSettings: true,
  },
  ADMIN: {
    canManageUsers: false,
    canViewAuditLogs: true,
    canDeleteTransactions: true,
    canCreateExpenses: true,
    canReceiveMoney: true,
    canManageProjects: true,
    canManageContractors: true,
    canManageSuppliers: true,
    canManageLoans: true,
    canManageMonthlyBills: true,
    canViewReports: true,
    canPrintVouchers: true,
    canViewLedger: true,
    canManageSettings: false,
  },
  ACCOUNTANT: {
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteTransactions: true,
    canCreateExpenses: true,
    canReceiveMoney: true,
    canManageProjects: false,
    canManageContractors: true,
    canManageSuppliers: true,
    canManageLoans: true,
    canManageMonthlyBills: true,
    canViewReports: true,
    canPrintVouchers: true,
    canViewLedger: true,
    canManageSettings: false,
  },
  PROJECT_MANAGER: {
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteTransactions: false,
    canCreateExpenses: true,
    canReceiveMoney: false,
    canManageProjects: false,
    canManageContractors: true,
    canManageSuppliers: true,
    canManageLoans: false,
    canManageMonthlyBills: false,
    canViewReports: true,
    canPrintVouchers: true,
    canViewLedger: false,
    canManageSettings: false,
  },
  SITE_ENGINEER: {
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteTransactions: false,
    canCreateExpenses: true,
    canReceiveMoney: false,
    canManageProjects: false,
    canManageContractors: false,
    canManageSuppliers: false,
    canManageLoans: false,
    canManageMonthlyBills: false,
    canViewReports: false,
    canPrintVouchers: true,
    canViewLedger: false,
    canManageSettings: false,
  },
  VIEWER: {
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteTransactions: false,
    canCreateExpenses: false,
    canReceiveMoney: false,
    canManageProjects: false,
    canManageContractors: false,
    canManageSuppliers: false,
    canManageLoans: false,
    canManageMonthlyBills: false,
    canViewReports: true,
    canPrintVouchers: false,
    canViewLedger: false,
    canManageSettings: false,
  },
};

export function hasPermission(role: UserRole | undefined, permission: keyof RolePermissions): boolean {
  if (!role) return false;
  return !!ROLE_PERMISSIONS[role]?.[permission];
}
