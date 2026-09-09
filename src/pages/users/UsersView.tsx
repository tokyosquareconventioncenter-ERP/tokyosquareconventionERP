/**
 * User Roles and Management View (SUPER_ADMIN / ADMIN)
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  Plus, 
  Mail, 
  Phone, 
  CheckCircle2, 
  X,
  Trash2,
  Lock,
  Pencil,
  ShieldCheck,
  Building
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { ROLE_PERMISSIONS } from '../../utils/permissions';

export const UsersView: React.FC = () => {
  const { language, t } = useLanguage();
  const { users, addUser, updateUser, deleteUser, projects } = useData();
  const { currentUser } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('ACCOUNTANT');
  
  // Edit state
  const [editModalUser, setEditModalUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('ACCOUNTANT');
  const [editPassword, setEditPassword] = useState('');

  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isBn = language === 'bn';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      phone: phone.trim() || '+880 1700-000000',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
    }, password || 'password123');

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPassword('password123');
    setPhone('');
    setRole('ACCOUNTANT');

    setNotice(isBn 
      ? `নতুন ব্যবহারকারী "${name}" সফলভাবে যুক্ত করা হয়েছে! এখন এই ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করা যাবে।` 
      : `New user "${name}" successfully created! They can now log in using these credentials.`);
  };

  const openEditModal = (user: UserProfile) => {
    setEditModalUser(user);
    setEditName(user.displayName);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditPassword('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser || !editName.trim() || !editEmail.trim()) return;

    updateUser(editModalUser.uid, {
      displayName: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      phone: editPhone.trim(),
      role: editRole,
    });

    setEditModalUser(null);
    setNotice(isBn 
      ? `ব্যবহারকারী "${editName}" এর তথ্য সফলভাবে আপডেট করা হয়েছে!` 
      : `User "${editName}" details updated successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.uid);
      setNotice(isBn 
        ? `ব্যবহারকারী "${userToDelete.displayName}" এর অ্যাকাউন্ট মুছে ফেলা হয়েছে।` 
        : `User account "${userToDelete.displayName}" removed successfully.`);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Notice */}
      {notice && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{notice}</span>
          </div>
          <button 
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>{isBn ? 'ব্যবহারকারী ও রোল ম্যানেজমেন্ট (RBAC)' : 'User Accounts & Roles (RBAC)'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBn 
              ? 'সুপার এডমিন, প্রজেক্ট ম্যানেজার, সাইট ইঞ্জিনিয়ার এবং হিসাবরক্ষক পারমিশন ও অ্যাকাউন্ট নিয়ন্ত্রণ' 
              : 'Granular Role-Based Access Control, permissions, and account management'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isBn ? '+ নতুন ব্যবহারকারী যুক্ত করুন' : '+ Create User Account'}</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {users.map((user) => {
          const perms = ROLE_PERMISSIONS[user.role];
          const isCurrentUser = currentUser?.uid === user.uid || currentUser?.email?.toLowerCase() === user.email.toLowerCase();

          return (
            <div 
              key={user.uid}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-600 transition relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md">
                    {user.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-100">{user.displayName}</h3>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                          {isBn ? 'বর্তমান' : 'You'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-400 mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    user.role === 'SUPER_ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                    user.role === 'PROJECT_MANAGER' ? 'bg-blue-500/20 text-blue-300' :
                    user.role === 'SITE_ENGINEER' ? 'bg-cyan-500/20 text-cyan-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {t(`role_${user.role}` as any)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(user)}
                      title={isBn ? 'সম্পাদনা করুন' : 'Edit user'}
                      className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setUserToDelete(user)}
                      title={isBn ? 'ব্যবহারকারী ডিলিট করুন' : 'Delete user account'}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Checklist Pill tags */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  {isBn ? 'সিস্টেম অনুমতিসমূহ:' : 'System Permissions:'}
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {perms?.canCreateExpenses && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium">✓ Expenses</span>
                  )}
                  {perms?.canReceiveMoney && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium">✓ Receive Money</span>
                  )}
                  {perms?.canDeleteTransactions && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-medium">✓ Delete Tx</span>
                  )}
                  {perms?.canManageProjects && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium">✓ Projects</span>
                  )}
                  {perms?.canManageUsers && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-medium">✓ RBAC Users</span>
                  )}
                  {perms?.canViewReports && (
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-medium">✓ Reports</span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <span>{isBn ? 'নতুন ব্যবহারকারী তৈরি করুন' : 'Create User Account'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পূর্ণ নাম' : 'Full Name'} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khandoker Raihan Islam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ইমেইল অ্যাড্রেস (লগইনের জন্য)' : 'Email Address'} *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@skrpproperties.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পাসওয়ার্ড' : 'Password'} *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712-000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যবহারকারী রোল' : 'User Role'} *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                >
                  <option value="SUPER_ADMIN">Super Admin / ম্যানেজিং ডিরেক্টর (Boss)</option>
                  <option value="ADMIN">Admin / এক্সিকিউটিভ ডিরেক্টর / চেয়ারম্যান</option>
                  <option value="PROJECT_MANAGER">Project Manager / সাইট ইন-চার্জ</option>
                  <option value="SITE_ENGINEER">Site Engineer / সাইট প্রকৌশলী</option>
                  <option value="ACCOUNTANT">Accountant / হিসাবরক্ষক</option>
                  <option value="VIEWER">Auditor / Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isBn ? 'অ্যাকাউন্ট সেভ করুন' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-600" />
                <span>{isBn ? 'ব্যবহারকারীর তথ্য সম্পাদনা' : 'Edit User Account'}</span>
              </h3>
              <button onClick={() => setEditModalUser(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পূর্ণ নাম' : 'Full Name'} *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যবহারকারী রোল' : 'User Role'} *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-purple-600"
                >
                  <option value="SUPER_ADMIN">Super Admin / ম্যানেজিং ডিরেক্টর (Boss)</option>
                  <option value="ADMIN">Admin / এক্সিকিউটিভ ডিরেক্টর / চেয়ারম্যান</option>
                  <option value="PROJECT_MANAGER">Project Manager / সাইট ইন-চার্জ</option>
                  <option value="SITE_ENGINEER">Site Engineer / সাইট প্রকৌশলী</option>
                  <option value="ACCOUNTANT">Accountant / হিসাবরক্ষক</option>
                  <option value="VIEWER">Auditor / Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isBn ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-lg text-rose-600">{isBn ? 'ব্যবহারকারী মুছে ফেলবেন?' : 'Confirm User Deletion'}</h3>
            <p className="text-xs text-slate-600">
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${userToDelete.displayName}" (${userToDelete.email}) অ্যাকাউন্টটি মুছে ফেলতে চান?` 
                : `Are you sure you want to delete user "${userToDelete.displayName}" (${userToDelete.email})?`}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
