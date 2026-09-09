/**
 * S.M. Khalilur Rahman Properties Ltd. — Construction Accounts & Project ERP
 * Master TypeScript Schema & Definitions
 */

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'ACCOUNTANT' 
  | 'PROJECT_MANAGER' 
  | 'SITE_ENGINEER' 
  | 'VIEWER';

export type Language = 'bn' | 'en';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  assignedProjects?: string[]; // Array of project IDs or ['ALL']
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Planning' | 'Running' | 'On Hold' | 'Completed' | 'Closed';

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  startDate: string;
  expectedEndDate: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  description?: string;
  projectManager?: string;
  createdAt: string;
  updatedAt: string;
  materialCost: number;
  labourCost: number;
  contractorCost: number;
  otherCost: number;
}

export type PaymentMethod = 'CASH' | 'BANK' | 'CHEQUE' | 'MOBILE_BANKING';

export type SourceType = 
  | 'Company Fund' 
  | 'Japan Garden City' 
  | 'Japan City Tower'
  | 'Share Voucher / Partner'
  | 'Loan' 
  | 'Director' 
  | 'Owner' 
  | 'Client' 
  | 'Other';

export interface ProjectAllocation {
  projectId: string;
  projectName?: string;
  amount: number;
}

export interface MoneyReceived {
  id: string;
  receiptNumber?: string;
  date: string;
  receivedFrom: string;
  sourceType: SourceType;
  projectId: string;
  projectName?: string;
  amount: number;
  projectAllocations?: ProjectAllocation[];
  paymentMethod: PaymentMethod;
  accountId: string; // 'cash' or 'bank'
  accountName?: string;
  reference?: string;
  description: string;
  attachmentUrl?: string;
  createdAt: string;
  createdBy: string;
}

export type ExpenseType = 
  | 'MATERIAL' 
  | 'LABOUR' 
  | 'CONTRACTOR' 
  | 'SALARY' 
  | 'CONVEYANCE' 
  | 'FOOD' 
  | 'ELECTRICITY' 
  | 'COMMON_SERVICE' 
  | 'OFFICE' 
  | 'TRANSPORT' 
  | 'OTHER';

export interface Expense {
  id: string;
  date: string;
  projectId: string;
  projectName?: string;
  expenseType: ExpenseType;
  category: string;
  subcategory?: string;
  paidTo: string;
  supplierId?: string;
  supplierName?: string;
  contractorId?: string;
  contractorName?: string;
  employeeId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  accountName?: string;
  description: string;
  reference?: string;
  voucherId?: string;
  voucherNumber?: string;
  attachmentUrl?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
  createdAt: string;
  createdBy: string;
}

export interface MaterialItem {
  id: string;
  date: string;
  projectId: string;
  projectName?: string;
  materialName: string;
  category: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  unit: string;
  rate: number;
  unitRate?: number;
  totalAmount: number;
  totalCost?: number;
  challanNumber?: string;
  paymentStatus: 'PAID' | 'DUE' | 'PARTIAL';
  voucherId?: string;
  voucherNumber?: string;
  expenseId?: string;
  createdAt: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: string; // e.g. Cement, Steel, Bricks, etc.
  openingDue: number;
  totalPurchase: number;
  totalPaid: number;
  currentDue: number;
  notes?: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  type: string; // e.g. Carpenter, Electrician, Plumber, Mason, Tiles, Painter, etc.
  phone: string;
  address?: string;
  projectId: string;
  projectName?: string;
  contractAmount: number;
  totalBill: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Active' | 'Completed' | 'Suspended';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface ContractorBill {
  id: string;
  date: string;
  projectId: string;
  projectName?: string;
  contractorId: string;
  contractorName: string;
  billAmount: number;
  description: string;
  status: 'APPROVED' | 'PENDING' | 'PAID';
  createdAt: string;
  createdBy: string;
}

export interface ContractorPayment {
  id: string;
  date: string;
  projectId: string;
  projectName?: string;
  contractorId: string;
  contractorName: string;
  workDescription: string;
  billAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  reference?: string;
  voucherId?: string;
  voucherNumber?: string;
  attachmentUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface MonthlyCompanyExpense {
  id: string;
  month: string; // e.g. "2026-08" or "August 2026"
  year: number;
  expenseName: string; // e.g. "Ilyas Salary", "Tutul Conveyance", "Tutul Food Bill", "Electricity"
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  description: string;
  date?: string;
  projectId?: string;
  projectName?: string;
  expenseId?: string;
  voucherId?: string;
  voucherNumber?: string;
  createdAt: string;
  createdBy: string;
}

export type LoanStatus = 'ACTIVE' | 'PARTIALLY_PAID' | 'FULLY_PAID';

export interface Loan {
  id: string;
  lenderName: string;
  date: string;
  amount: number;
  projectId?: string;
  projectName?: string;
  purpose: string;
  paymentMethod: PaymentMethod;
  repaymentAmount: number;
  repaidAmount?: number;
  outstandingAmount: number;
  status: LoanStatus;
  reference?: string;
  phone?: string;
  lenderType?: string;
  createdAt: string;
  createdBy: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  lenderName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  reference?: string;
  voucherId?: string;
  voucherNumber?: string;
  createdAt: string;
  createdBy: string;
}

export interface AccountTransfer {
  id: string;
  date: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  transferType: 'BANK_TO_CASH' | 'CASH_TO_BANK' | 'BANK_TO_BANK' | 'CASH_TO_CASH';
  projectId?: string;
  projectName?: string;
  description: string;
  reference?: string;
  voucherNumber?: string;
  createdAt: string;
  createdBy: string;
}

export type AccountType = 'CASH' | 'BANK' | 'OTHER';

export interface Account {
  id: string;
  name: string; // "Cash in Hand", "City Bank Ltd - A/C: 1029384", etc.
  type: AccountType;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
  openingBalance: number;
  totalReceived: number;
  totalPaid: number;
  currentBalance: number;
  isDefault?: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  voucherNo?: string;
  voucherNumber?: string;
  reference?: string;
  transactionId: string;
  transactionType: 'EXPENSE' | 'MONEY_RECEIVED' | 'CONTRACTOR_PAYMENT' | 'SUPPLIER_PAYMENT' | 'LOAN_RECEIVED' | 'LOAN_REPAID' | 'MONTHLY_BILL' | string;
  description: string;
  particulars?: string;
  projectId?: string;
  projectName?: string;
  projectAllocations?: {
    projectId: string;
    projectName: string;
    amount: number;
  }[];
  category: string;
  received: number;
  payment: number;
  balance: number;
  runningBalance?: number;
  amount?: number;
  type?: 'DEBIT' | 'CREDIT';
  person?: string;
  paymentMethod?: PaymentMethod;
  accountId: string;
  accountName?: string;
  createdAt: string;
  createdBy: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string; // Format: CPV-2026-000001
  date: string;
  projectId: string;
  projectName: string;
  paidTo: string;
  category: string;
  description: string;
  amount: number;
  amountInWordsBn: string;
  amountInWordsEn: string;
  paymentMethod: PaymentMethod;
  preparedBy: string;
  receivedBy?: string;
  authorizedBy?: string;
  macSign?: string;
  drSign?: string;
  dmdSign?: string;
  accountName?: string;
  reference?: string;
  attachmentUrl?: string;
  transactionId: string;
  transactionType: 'EXPENSE' | 'CONTRACTOR_PAYMENT' | 'SUPPLIER_PAYMENT' | 'SALARY' | 'MONTHLY_BILL' | 'MONEY_RECEIVED' | 'SHARE_VOUCHER' | 'TRANSFER' | 'OTHER';
  status: 'ACTIVE' | 'CANCELLED';
  printCount?: number;
  createdAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string; // e.g. "CREATE_EXPENSE", "LOGIN", "GENERATE_VOUCHER"
  module: string; // e.g. "Expenses", "Auth", "Vouchers", "Projects"
  recordId: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  date: string;
  read: boolean;
  link?: string;
}

export interface CompanySettings {
  companyName: string;
  companyNameBn: string;
  erpTitle: string;
  erpTitleBn: string;
  address: string;
  addressBn: string;
  phone: string;
  email: string;
  logoUrl?: string;
  allowNegativeBalance: boolean;
  autoGenerateVouchers: boolean;
  currencySymbol: string;
}

// Convenient Aliases
export type MaterialPurchase = MaterialItem;
export type MonthlyBill = MonthlyCompanyExpense;

