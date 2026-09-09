/**
 * S.M. Khalilur Rahman Properties Ltd. — Construction Accounts & Project ERP
 * Master Application Root Component
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { LoginPage } from './pages/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { ActiveNavView } from './components/layout/Sidebar';
import { Voucher } from './types';
import { Loader2 } from 'lucide-react';
import { hasPermission } from './utils/permissions';

// View Imports
import { DashboardView } from './pages/dashboard/DashboardView';
import { ProjectsView } from './pages/projects/ProjectsView';
import { ExpensesView } from './pages/expenses/ExpensesView';
import { MoneyReceivedView } from './pages/money/MoneyReceivedView';
import { VouchersView } from './pages/vouchers/VouchersView';
import { ContractorsView } from './pages/contractors/ContractorsView';
import { SuppliersView } from './pages/suppliers/SuppliersView';
import { MaterialsView } from './pages/materials/MaterialsView';
import { MonthlyBillsView } from './pages/monthly/MonthlyBillsView';
import { LoansView } from './pages/loans/LoansView';
import { AccountsView } from './pages/accounts/AccountsView';
import { LedgerView } from './pages/ledger/LedgerView';
import { ReportsView } from './pages/reports/ReportsView';
import { UsersView } from './pages/users/UsersView';
import { AuditLogsView } from './pages/audit/AuditLogsView';
import { SettingsView } from './pages/settings/SettingsView';
import { NewTransactionModal, TransactionModalTab } from './components/transactions/NewTransactionModal';

const AuthenticatedERPApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveNavView>('DASHBOARD');
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [defaultTxTab, setDefaultTxTab] = useState<TransactionModalTab>('EXPENSE');

  const openNewTransactionWithTab = (tab: TransactionModalTab = 'EXPENSE') => {
    setDefaultTxTab(tab);
    setIsTxModalOpen(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenNewTransaction={() => openNewTransactionWithTab('EXPENSE')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'PROJECTS':
        return <ProjectsView />;
      case 'EXPENSES':
        return (
          <ExpensesView
            onOpenNewExpense={() => openNewTransactionWithTab('EXPENSE')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'MONEY_RECEIVED':
        return (
          <MoneyReceivedView
            onOpenNewMoneyIn={() => openNewTransactionWithTab('MONEY_IN')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'VOUCHERS':
        return (
          <VouchersView
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'CONTRACTORS':
      case 'CONTRACTOR_PAYMENTS':
        return (
          <ContractorsView
            onOpenNewContractorPayment={() => openNewTransactionWithTab('CONTRACTOR_PAYMENT')}
          />
        );
      case 'SUPPLIERS':
        return (
          <SuppliersView
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'MATERIALS':
        return (
          <MaterialsView
            onOpenNewMaterialExpense={() => openNewTransactionWithTab('EXPENSE')}
          />
        );
      case 'MONTHLY_BILLS':
        return (
          <MonthlyBillsView
            onOpenNewMonthlyBill={() => openNewTransactionWithTab('MONTHLY_BILL')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'LOANS':
        return (
          <LoansView
            onOpenNewLoanTx={() => openNewTransactionWithTab('LOAN_REPAY')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
      case 'ACCOUNTS':
        return (
          <AccountsView
            onOpenNewTransaction={(tab: TransactionModalTab = 'EXPENSE') => openNewTransactionWithTab(tab)}
            onOpenTransfer={() => openNewTransactionWithTab('TRANSFER')}
          />
        );
      case 'LEDGER':
        return <LedgerView />;
      case 'REPORTS':
        return <ReportsView />;
      case 'USERS':
        return hasPermission(currentUser?.role, 'canManageUsers') ? <UsersView /> : <DashboardView onNavigate={setCurrentView} onOpenNewTransaction={() => openNewTransactionWithTab('EXPENSE')} onSelectVoucher={setActiveVoucher} />;
      case 'AUDIT_LOGS':
        return hasPermission(currentUser?.role, 'canViewAuditLogs') ? <AuditLogsView /> : <DashboardView onNavigate={setCurrentView} onOpenNewTransaction={() => openNewTransactionWithTab('EXPENSE')} onSelectVoucher={setActiveVoucher} />;
      case 'SETTINGS':
        return hasPermission(currentUser?.role, 'canManageSettings') ? <SettingsView /> : <DashboardView onNavigate={setCurrentView} onOpenNewTransaction={() => openNewTransactionWithTab('EXPENSE')} onSelectVoucher={setActiveVoucher} />;
      default:
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenNewTransaction={() => openNewTransactionWithTab('EXPENSE')}
            onSelectVoucher={(v) => setActiveVoucher(v)}
          />
        );
    }
  };

  return (
    <AppLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      activeVoucher={activeVoucher}
      setActiveVoucher={setActiveVoucher}
      onOpenQuickTransaction={() => openNewTransactionWithTab('EXPENSE')}
    >
      {renderCurrentView()}

      <div className="print:hidden">
        <NewTransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onVoucherCreated={(v) => setActiveVoucher(v)}
          initialType={defaultTxTab}
        />
      </div>
    </AppLayout>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div 
        id="app-initial-loader"
        className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3"
      >
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm font-semibold tracking-wider text-slate-400">
          S.M. Khalilur Rahman Properties Ltd.
        </span>
      </div>
    );
  }

  return currentUser ? (
    <DataProvider>
      <AuthenticatedERPApp />
    </DataProvider>
  ) : (
    <LoginPage />
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
