/**
 * Cash Payment Voucher & Money Receipt Printable Engine
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 * Supports A5 (Half of A4 - ready to cut), A4 Dual (Office + Recipient copy), & Full A4
 * Accurately displays entered data, in-words amount, and synchronized company profile
 */
import React, { useState, useEffect } from 'react';
import { Voucher } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  FileText, 
  Receipt,
  Scissors,
  Copy,
  Camera,
  Eye,
  ZoomIn
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { convertNumberToWordsBn, convertNumberToWordsEn } from '../../utils/numberToWords';

interface VoucherModalProps {
  voucher: Voucher | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, onClose }) => {
  const { language } = useLanguage();
  const { settings } = useData();
  const [printLayout, setPrintLayout] = useState<'A5' | 'A4_SINGLE' | 'A4_DUAL'>('A5');
  const [printLang, setPrintLang] = useState<'bn' | 'en'>('en'); // Default to English as shown in user's image eeee.JPG
  const [showAttachmentModal, setShowAttachmentModal] = useState<boolean>(false);

  // Close modal with Escape key so user is never stuck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!voucher) return null;

  const handlePrint = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const isBn = printLang === 'bn';

  // Determine document type badge
  const isMoneyReceipt = 
    voucher.transactionType === 'MONEY_RECEIVED' || 
    voucher.voucherNumber.startsWith('MR-') ||
    voucher.category.toLowerCase().includes('received');

  const isShareVoucher = 
    voucher.transactionType === 'SHARE_VOUCHER' ||
    voucher.category.toLowerCase().includes('share') ||
    voucher.description.toLowerCase().includes('share');

  const isMonthlyBill = 
    voucher.transactionType === 'MONTHLY_BILL' ||
    voucher.category.toLowerCase().includes('salary') ||
    voucher.category.toLowerCase().includes('conveyance');

  const isTransferVoucher = 
    voucher.transactionType === 'TRANSFER' ||
    voucher.voucherNumber.startsWith('CTV-') ||
    voucher.category.toLowerCase().includes('transfer') ||
    voucher.category.toLowerCase().includes('withdrawal');

  let docTitleBn = 'ক্যাশ পেমেন্ট / ডেবিট ভাউচার';
  let docTitleEn = 'CASH PAYMENT / DEBIT VOUCHER';

  if (isTransferVoucher) {
    docTitleBn = 'তহবিল স্থানান্তর / কন্ট্রা ভাউচার (CONTRA VOUCHER)';
    docTitleEn = 'CONTRA FUND TRANSFER VOUCHER';
  } else if (isMoneyReceipt) {
    docTitleBn = 'টাকা প্রাপ্তির রশিদ (MONEY RECEIPT)';
    docTitleEn = 'OFFICIAL MONEY RECEIPT';
  } else if (isShareVoucher) {
    docTitleBn = 'শেয়ার ভাউচার / জমা রশিদ';
    docTitleEn = 'SHARE VOUCHER / DEPOSIT RECEIPT';
  } else if (isMonthlyBill) {
    docTitleBn = 'মাসিক অফিস খরচ / বেতন ভাউচার';
    docTitleEn = 'MONTHLY EXPENSE & SALARY VOUCHER';
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible print:min-h-0 print:h-auto print:w-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="voucher-modal-container" 
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:bg-white print:min-h-0 print:h-auto"
      >
        {/* Modal Toolbar (Strictly hidden during browser print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {isMoneyReceipt ? <Receipt className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>{isBn ? docTitleBn : docTitleEn}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {voucher.voucherNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBn 
                  ? 'A4 কাগজ অর্ধেক কেটে প্রিন্ট দিন অথবা ২ কপি একসাথে প্রিন্ট করুন (সাদা কাগজ)' 
                  : 'A4 half-page cut print ready or dual copies on clean white sheet'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintLang('en')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  printLang === 'en' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPrintLang('bn')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  printLang === 'bn' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Layout Presets Switch */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintLayout('A5')}
                title="Print on top half of A4 page so you can cut the paper in half"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  printLayout === 'A5' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isBn ? 'A5 (A4 অর্ধেক কাট)' : 'A5 (A4 Half Cut)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('A4_DUAL')}
                title="Print 2 copies (Office + Client) on 1 single A4 sheet"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  printLayout === 'A4_DUAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isBn ? 'A4 ডাবল কপি' : 'A4 Dual Copy'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('A4_SINGLE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  printLayout === 'A4_SINGLE' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isBn ? 'A4 সিঙ্গেল' : 'A4 Full'}
              </button>
            </div>

            {/* View Attached Bill Photo Button (if exists) */}
            {voucher.attachmentUrl && (
              <button
                type="button"
                onClick={() => setShowAttachmentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                title="দোকানের ক্যাশ মেমো বা বিলের ছবি দেখুন"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isBn ? 'দোকানের মেমো / ছবি' : 'View Bill Photo'}</span>
              </button>
            )}

            {/* Print Action Button */}
            <button
              type="button"
              onClick={handlePrint}
              id="voucher-print-button"
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট রশিদ / ভাউচার' : 'Print Receipt'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title={isBn ? 'বন্ধ করুন ও কাজে ফিরে যান (Esc)' : 'Close and return to work (Esc)'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition cursor-pointer text-xs font-bold"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{isBn ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible print:min-h-0 print:h-auto">
          <div className="w-full max-w-3xl space-y-4 print:space-y-3 print:max-w-none print:bg-white">
            
            {/* FIRST VOUCHER / RECEIPT COPY */}
            <div className="print-receipt-card print:bg-white">
              <VoucherDocumentBody 
                voucher={voucher} 
                settings={settings} 
                isBn={isBn} 
                docTitle={isBn ? docTitleBn : docTitleEn}
                copyLabel={printLayout === 'A4_DUAL' ? (isBn ? 'অফিস কপি (Office Copy)' : 'OFFICE COPY') : undefined}
                isCompact={printLayout === 'A5' || printLayout === 'A4_DUAL'}
              />
            </div>

            {/* CUT LINE GUIDELINE IN A5 MODE (Prints on paper so user can slice A4 in half) */}
            {printLayout === 'A5' && (
              <div className="hidden print:flex items-center justify-center gap-2 pt-4 pb-2 text-slate-500 text-[10px] font-mono tracking-widest print-receipt-card print:bg-white">
                <span>✂ - - - - - - - - - - - - - - - - - - - - {isBn ? 'A4 কাগজের অর্ধেক কেটে নিন (Cut Line)' : 'A4 Paper Half Cut Line'} - - - - - - - - - - - - - - - - - - - -</span>
              </div>
            )}

            {/* SECOND COPY IF A4 DUAL SELECTED */}
            {printLayout === 'A4_DUAL' && (
              <>
                <div className="border-t-2 border-dashed border-slate-400 my-2 text-center relative print:my-2 print-receipt-card print:bg-white">
                  <span className="bg-slate-100 print:bg-white px-3 text-[10px] text-slate-500 font-mono uppercase tracking-wider relative -top-2.5">
                    ✂ {isBn ? 'কেটে সংরক্ষণ করুন — গ্রাহক / প্রাপক কপি' : 'Tear / Cut Here — Client / Recipient Copy'}
                  </span>
                </div>

                <div className="print-receipt-card print:bg-white">
                  <VoucherDocumentBody 
                    voucher={voucher} 
                    settings={settings} 
                    isBn={isBn} 
                    docTitle={isBn ? docTitleBn : docTitleEn}
                    copyLabel={isBn ? 'গ্রাহক / প্রাপক কপি (Client Copy)' : 'CLIENT / RECIPIENT COPY'} 
                    isCompact={true}
                  />
                </div>
              </>
            )}

            {/* Attached Shop Cash Memo / Receipt Photo Section (Screen only) */}
            {voucher.attachmentUrl && (
              <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs print:hidden space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-600 flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span>{isBn ? 'সংযুক্ত ক্যাশ মেমো / বিলের ছবি (দোকান / সরবরাহকারী)' : 'Attached Bill Memo / Receipt Photo'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAttachmentModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বড় করে দেখুন' : 'View Full Size'}</span>
                  </button>
                </div>
                <div 
                  onClick={() => setShowAttachmentModal(true)}
                  className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 hover:border-amber-500 transition max-w-sm group relative"
                >
                  <img 
                    src={voucher.attachmentUrl} 
                    alt="Attached memo" 
                    className="w-full max-h-56 object-contain bg-slate-50"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                    <ZoomIn className="w-4 h-4" />
                    <span>{isBn ? 'সম্পূর্ণ দেখতে ক্লিক করুন' : 'Click to zoom full screen'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {isBn 
                ? 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ — সম্পূর্ণ সাদা পাতায় নিখুঁত প্রিন্ট' 
                : 'S.M. Khalilur Rahman Properties Ltd. — 100% Clean White Sheet Printing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট দিন' : 'Print Now'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer text-xs active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isBn ? 'বন্ধ করুন (কাজে ফিরে যান)' : 'Close & Return to Work'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Memo Viewer Modal */}
      {showAttachmentModal && voucher.attachmentUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setShowAttachmentModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    {isBn ? 'দোকানের ক্যাশ মেমো / বিলের স্পষ্ট ছবি' : 'Attached Shop Bill / Cash Memo'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {voucher.voucherNumber} • {voucher.date} • {voucher.recipientOrPayee}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center overflow-auto flex-1 max-h-[75vh]">
              <img 
                src={voucher.attachmentUrl} 
                alt="Full memo" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md border border-slate-200"
              />
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium">
                {isBn ? 'মালের বিবরণ ও রেট নিখুঁতভাবে পরীক্ষা করুন' : 'Verify item rate & quantities directly from original receipt'}
              </span>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface VoucherDocumentBodyProps {
  voucher: Voucher;
  settings: any;
  isBn: boolean;
  docTitle: string;
  copyLabel?: string;
  isCompact?: boolean;
}

const VoucherDocumentBody: React.FC<VoucherDocumentBodyProps> = ({ 
  voucher, 
  settings, 
  isBn, 
  docTitle,
  copyLabel,
  isCompact = false
}) => {
  const isMoneyReceipt = 
    voucher.transactionType === 'MONEY_RECEIVED' || 
    voucher.voucherNumber.startsWith('MR-') ||
    voucher.category.toLowerCase().includes('received');

  // Compute 100% mathematically exact words in both languages
  const wordsBn = convertNumberToWordsBn(voucher.amount);
  const wordsEn = convertNumberToWordsEn(voucher.amount);

  // Dynamic Company Details from DataContext Settings
  const companyName = isBn 
    ? (settings?.companyNameBn || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ')
    : (settings?.companyName || 'S.M. Khalilur Rahman Properties Ltd.');

  const address = isBn 
    ? (settings?.addressBn || settings?.address || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ')
    : (settings?.address || '21, 22 Durgabari Road, Mymensingh');

  const phone = settings?.phone || '01672965561';
  const email = settings?.email || 'info@skrpproperties.com';

  return (
    <div className={`bg-white border-2 border-slate-900 rounded-2xl shadow-sm text-slate-950 font-sans print:border-2 print:border-black print:shadow-none print:rounded-2xl print:bg-white ${
      isCompact ? 'p-2.5 sm:p-3.5 mb-1' : 'p-5 sm:p-7 mb-2'
    }`}>
      
      {/* Top Header & Company Info */}
      <div className="text-center border-b border-slate-800 pb-1.5 mb-2 relative flex flex-col items-center">
        {copyLabel && (
          <span className="absolute top-0 right-0 text-[9px] font-black px-1.5 py-0.5 border border-slate-800 rounded uppercase bg-slate-100 text-slate-900">
            {copyLabel}
          </span>
        )}
        {settings?.logoUrl && (
          <div className={`mb-1 ${isCompact ? 'w-8 h-8' : 'w-11 h-11'} rounded-lg overflow-hidden border border-slate-800 shrink-0`}>
            <img 
              src={settings.logoUrl} 
              alt="Company Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className={`font-black tracking-tight text-slate-950 font-serif leading-tight ${
          isCompact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
        }`}>
          {companyName}
        </h1>
        <p className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-slate-700 font-medium mt-0.5`}>
          {address}
        </p>
        <p className={`${isCompact ? 'text-[9px]' : 'text-[10px]'} text-slate-600`}>
          Phone: {phone} | Email: {email}
        </p>
        
        <div className={`inline-block mt-1 px-2.5 py-0.5 bg-slate-900 text-white font-black tracking-wider uppercase rounded-md shadow-xs print-badge-dark ${
          isCompact ? 'text-[10px]' : 'text-xs'
        }`}>
          {docTitle}
        </div>
      </div>

      {/* Metadata Bar (4 Columns: Voucher No, Date, Payment Mode, Project) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2 bg-slate-50 print-table-header p-1.5 rounded-lg border border-slate-300 text-xs">
        <div>
          <span className="text-slate-600 block text-[9px] font-bold">
            {isBn ? (isMoneyReceipt ? 'রশিদ নম্বর:' : 'ভাউচার নম্বর:') : (isMoneyReceipt ? 'Receipt No:' : 'Voucher No:')}
          </span>
          <span className="font-mono font-black text-slate-950 text-xs">{voucher.voucherNumber}</span>
        </div>
        <div>
          <span className="text-slate-600 block text-[9px] font-bold">{isBn ? 'তারিখ:' : 'Date:'}</span>
          <span className="font-bold text-slate-950 text-xs">{formatDisplayDate(voucher.date, isBn ? 'bn' : 'en')}</span>
        </div>
        <div>
          <span className="text-slate-600 block text-[9px] font-bold">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Mode:'}</span>
          <span className="font-bold text-slate-950 uppercase text-xs">{voucher.paymentMethod}</span>
        </div>
        <div>
          <span className="text-slate-600 block text-[9px] font-bold">{isBn ? 'প্রকল্প / শাখা:' : 'Project / Branch:'}</span>
          <span className="font-bold text-slate-950 truncate block text-xs">{voucher.projectName || 'General Company Account'}</span>
        </div>
      </div>

      {/* Main Details Table — Exact Entered Data */}
      <div className="border border-slate-800 rounded-lg overflow-hidden mb-2">
        <table className="w-full text-xs text-left border-collapse">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="py-1 px-2.5 bg-slate-100 print-table-header font-bold text-slate-800 w-1/3 border-r border-slate-300 text-[11px]">
                {isBn 
                  ? (isMoneyReceipt ? 'কার নিকট হতে প্রাপ্ত:' : 'প্রাপকের নাম (Paid To):') 
                  : (isMoneyReceipt ? 'Received From:' : 'Paid To / Payee:')}
              </td>
              <td className={`py-1 px-2.5 font-black text-slate-950 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {voucher.paidTo || 'N/A'}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="py-1 px-2.5 bg-slate-100 print-table-header font-bold text-slate-800 border-r border-slate-300 text-[11px]">
                {isBn ? 'হিসাবের খাত (Head of Account):' : 'Category / Head:'}
              </td>
              <td className="py-1 px-2.5 font-semibold text-slate-900">
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 print-table-header text-slate-900 rounded font-bold text-[10px] border border-slate-300 uppercase">
                  {voucher.category}
                </span>
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="py-1 px-2.5 bg-slate-100 print-table-header font-bold text-slate-800 align-top border-r border-slate-300 text-[11px]">
                {isBn ? 'কাজের বিবরণ (Particulars):' : 'Particulars / Description:'}
              </td>
              <td className="py-1 px-2.5 text-slate-950 font-medium whitespace-pre-wrap leading-tight text-[11px]">
                {voucher.description || 'N/A'}
              </td>
            </tr>

            {voucher.reference && (
              <tr className="border-b border-slate-300">
                <td className="py-1 px-2.5 bg-slate-100 print-table-header font-bold text-slate-800 border-r border-slate-300 text-[11px]">
                  {isBn ? 'রেফারেন্স / চেক নং:' : 'Reference / Cheque:'}
                </td>
                <td className="py-1 px-2.5 font-mono font-bold text-slate-900 text-[11px]">
                  {voucher.reference}
                </td>
              </tr>
            )}

            <tr className="bg-slate-50 print-amount-cell">
              <td className="py-1.5 px-2.5 bg-slate-200 print-table-header font-black text-slate-950 border-r border-slate-300 text-[11px]">
                {isBn ? 'মোট টাকার পরিমাণ (Amount):' : 'Total Amount (Tk):'}
              </td>
              <td className={`py-1.5 px-2.5 font-mono font-black text-slate-950 ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                {formatCurrency(voucher.amount, isBn ? 'bn' : 'en')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* In Words Section — Highlighting Mathematically Exact Text */}
      <div className="bg-amber-50/90 border border-amber-300 print-words-box p-1.5 rounded-lg mb-2 text-[11px]">
        <span className="font-bold text-slate-950 mr-1.5">
          {isBn ? 'টাকা কথায়:' : 'In Words:'}
        </span>
        <span className="font-bold text-slate-900">
          {isBn ? wordsBn : wordsEn}
        </span>
      </div>

      {/* Official Signatures Section (5 Columns) */}
      <div className={`grid grid-cols-5 gap-1.5 text-center text-[9px] ${isCompact ? 'pt-4' : 'pt-7'}`}>
        {/* 1. Prepared By */}
        <div className="flex flex-col items-center justify-end">
          <div className="h-6 flex items-end justify-center w-full mb-0.5 text-[9.5px] font-bold text-slate-900">
            {/* Prepared By Name: MD. Tanveen Ahmed */}
            {(() => {
              const prep = voucher.preparedBy || '';
              if (
                !prep ||
                prep.toLowerCase().includes('tokyo square') || 
                prep.toLowerCase().includes('super admin') ||
                prep.toLowerCase().includes('eleyes') ||
                prep.toLowerCase().includes('ilyas')
              ) {
                return 'MD. Tanveen Ahmed';
              }
              return prep;
            })()}
          </div>
          <div className="w-full border-t-2 border-slate-900 pt-0.5 font-black text-slate-900 text-[9px]">
            {isBn ? 'প্রস্তুতকারী (স্বাক্ষর)' : 'Prepared By (Sign)'}
          </div>
          <div className="text-[8px] text-slate-600 font-medium">
            {isBn ? 'হিসাব বিভাগ' : 'Accounts Section'}
          </div>
        </div>

        {/* 2. Received / Paid By */}
        <div className="flex flex-col items-center justify-end">
          <div className="h-6 flex items-end justify-center w-full mb-0.5 text-[9px] font-bold text-slate-900 truncate px-0.5">
            {voucher.paidTo || voucher.receivedBy || ''}
          </div>
          <div className="w-full border-t-2 border-slate-900 pt-0.5 font-black text-slate-900 text-[9px]">
            {isBn ? (isMoneyReceipt ? 'প্রদানকারী' : 'গ্রহীতার স্বাক্ষর') : (isMoneyReceipt ? 'Paid By' : 'Receiver Sign')}
          </div>
          <div className="text-[8px] text-slate-600 font-medium">
            {isBn ? 'স্বাক্ষর ও মোবাইল' : 'Sign & Contact'}
          </div>
        </div>

        {/* 3. Accounts Officer */}
        <div className="flex flex-col items-center justify-end">
          <div className="h-6 flex items-end justify-center w-full mb-0.5 text-[9px] font-bold text-slate-800">
            {/* Space for hand signature */}
          </div>
          <div className="w-full border-t-2 border-slate-900 pt-0.5 font-black text-slate-900 text-[9px]">
            {isBn ? 'হিসাবরক্ষণ কর্মকর্তা' : 'Accounts Officer'}
          </div>
          <div className="text-[8px] text-slate-600 font-medium">
            {isBn ? 'যাচাইকৃত' : 'Checked & Verified'}
          </div>
        </div>

        {/* 4. Project Manager */}
        <div className="flex flex-col items-center justify-end">
          <div className="h-6 flex items-end justify-center w-full mb-0.5 text-[9px] font-bold text-slate-800">
            {/* Space for hand signature */}
          </div>
          <div className="w-full border-t-2 border-slate-900 pt-0.5 font-black text-slate-900 text-[9px]">
            {isBn ? 'সাইট ইনচার্জ / পিএম' : 'Site In-charge / PM'}
          </div>
          <div className="text-[8px] text-slate-600 font-medium">
            {isBn ? 'প্রকল্প ব্যবস্থাপনা' : 'Project Management'}
          </div>
        </div>

        {/* 5. Managing Director */}
        <div className="flex flex-col items-center justify-end">
          <div className="h-6 flex items-end justify-center w-full mb-0.5 text-[9px] font-bold text-slate-950">
            {/* Space for MD sign */}
          </div>
          <div className="w-full border-t-2 border-slate-900 pt-0.5 font-black text-slate-950 text-[9px]">
            {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
          </div>
          <div className="text-[8px] text-slate-600 font-medium">
            {isBn ? 'অনুমোদন ও সিল' : 'Approval & Seal'}
          </div>
        </div>
      </div>

      {!isCompact && (
        <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
          {isBn 
            ? 'এটি একটি কম্পিউটার জেনারেটেড অফিসিয়াল ভাউচার — এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ' 
            : 'Authorized computerized ERP voucher — S.M. Khalilur Rahman Properties Ltd.'}
        </div>
      )}

    </div>
  );
};
