/**
 * Audit Logs Trail View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  UserCheck, 
  FileText, 
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { formatDisplayDate } from '../../i18n/formatters';

export const AuditLogsView: React.FC = () => {
  const { language } = useLanguage();
  const { auditLogs } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const isBn = language === 'bn';

  const filtered = auditLogs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>{isBn ? 'সিস্টেম অডিট ট্রেইল ও নিরাপত্তা লগ' : 'Security Audit Trail & Activity Logs'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBn 
              ? 'কে, কখন, কোন লেনদেন তৈরি, সম্পাদনা বা বাতিল করেছেন তার অপরিবর্তনীয় অডিট হিস্টোরি' 
              : 'Immutable record of all financial creation, deletions, edits, and authentication events'}
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {isBn ? `মোট লগ এন্ট্রি: ${auditLogs.length} টি` : `Total logs: ${auditLogs.length}`}
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isBn ? 'ব্যবহারকারীর নাম, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন...' : 'Search by user, action, details...'}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 outline-hidden font-medium"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">{isBn ? 'টাইমস্ট্যাম্প' : 'Timestamp'}</th>
                <th className="py-3 px-4">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                <th className="py-3 px-4">{isBn ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="py-3 px-4">{isBn ? 'এনটিটি' : 'Entity'}</th>
                <th className="py-3 px-4">{isBn ? 'বিবরণ ও কারণ' : 'Description & Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.action === 'DELETE' ? 'bg-rose-500/20 text-rose-300' :
                      log.action === 'UPDATE' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-slate-400 uppercase text-[11px]">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <p className="max-w-md truncate">{log.description}</p>
                    {log.details && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {JSON.stringify(log.details)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
