/**
 * Authentication Service
 * S.M. Khalilur Rahman Properties Ltd.
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase/config';
import { UserProfile, UserRole } from '../../types';

// Pre-configured system roles for development & testing
export const DEMO_USERS: Record<string, { profile: UserProfile; password: string; altPasswords?: string[] }> = {
  'khanmahmud97@gmail.com': {
    password: 'city@1234',
    altPasswords: ['city@12345', 'city@123456', '123456', 'password123', '965561'],
    profile: {
      uid: 'admin-khan-mahmud-01',
      email: 'khanmahmud97@gmail.com',
      displayName: 'Khan Mahmud (Admin)',
      role: 'ADMIN',
      phone: '+880 1711-000000',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-09-21T00:00:00Z',
    }
  },
  'tokyosquareconventioncenter@gmail.com': {
    password: 'password123',
    altPasswords: ['965561', 'city@1234', 'city@12345'],
    profile: {
      uid: 'super-admin-tokyo-01',
      email: 'tokyosquareconventioncenter@gmail.com',
      displayName: 'Engr. Tutul (Super Admin)',
      role: 'SUPER_ADMIN',
      phone: '+880 1711-000000',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'engtotul176@gmail.com': {
    password: 'password123',
    altPasswords: ['965561', 'city@1234', 'city@12345'],
    profile: {
      uid: 'super-admin-totul-02',
      email: 'engtotul176@gmail.com',
      displayName: 'Engr. Tutul (Super Admin)',
      role: 'SUPER_ADMIN',
      phone: '+880 1711-000000',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'superadmin@skrpproperties.com': {
    password: 'password123',
    profile: {
      uid: 'demo-super-admin-01',
      email: 'superadmin@skrpproperties.com',
      displayName: 'S.M. Khalilur Rahman (Super Admin)',
      role: 'SUPER_ADMIN',
      phone: '+880 1711-000000',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'raihan@skrpproperties.com': {
    password: 'password123',
    profile: {
      uid: 'demo-director-05',
      email: 'raihan@skrpproperties.com',
      displayName: 'Khandoker Raihan Islam (Executive Director)',
      role: 'ADMIN',
      phone: '+880 1712-999888',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'accountant@skrpproperties.com': {
    password: 'password123',
    profile: {
      uid: 'demo-accountant-02',
      email: 'accountant@skrpproperties.com',
      displayName: 'MD. eleyes',
      role: 'ACCOUNTANT',
      phone: '+880 1812-111111',
      assignedProjects: ['ALL'],
      status: 'ACTIVE',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'pm.tokyo@skrpproperties.com': {
    password: 'password123',
    profile: {
      uid: 'demo-pm-03',
      email: 'pm.tokyo@skrpproperties.com',
      displayName: 'Tutul Ahmed (Project Manager - Tokyo Square)',
      role: 'PROJECT_MANAGER',
      phone: '+880 1913-222222',
      assignedProjects: ['prj-tokyo-a'],
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  },
  'engineer@skrpproperties.com': {
    password: 'password123',
    profile: {
      uid: 'demo-engineer-04',
      email: 'engineer@skrpproperties.com',
      displayName: 'Engr. Sohel Rana (Site Engineer)',
      role: 'SITE_ENGINEER',
      phone: '+880 1614-333333',
      assignedProjects: ['prj-tokyo-a'],
      status: 'ACTIVE',
      createdAt: '2026-02-15T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    }
  }
};

export const isDeletedUser = (uid?: string): boolean => {
  if (!uid) return false;
  try {
    const raw = localStorage.getItem('skrp_deleted_user_ids');
    if (raw) {
      const list: string[] = JSON.parse(raw);
      return list.includes(uid);
    }
  } catch {}
  return false;
};

export const getCustomUserCredentials = (): Record<string, { profile: UserProfile; password: string }> => {
  try {
    const raw = localStorage.getItem('skrp_custom_user_credentials');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveCustomUserCredential = (profile: UserProfile, password?: string) => {
  try {
    const existing = getCustomUserCredentials();
    existing[profile.email.toLowerCase().trim()] = {
      profile,
      password: password || 'password123',
    };
    localStorage.setItem('skrp_custom_user_credentials', JSON.stringify(existing));
  } catch (e) {
    console.error(e);
  }
};

export const authService = {
  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const trimmedEmail = email.trim().toLowerCase();

    // 0. Master Developer Pin Bypass (965561) -> Always grants instant Super Admin access
    if (pass === '965561' || (trimmedEmail.includes('engtotul') && pass === '965561')) {
      const devProfile: UserProfile = {
        uid: 'super-admin-master-pin',
        email: trimmedEmail || 'engtotul176@gmail.com',
        displayName: 'Engr. Tutul (Super Admin)',
        role: 'SUPER_ADMIN',
        phone: '+880 1711-000000',
        assignedProjects: ['ALL'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('skrp_current_user', JSON.stringify(devProfile));
      return devProfile;
    }

    // 1. If Firebase Auth is configured and ready, attempt Live Cloud Authentication
    if (auth && isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const user = cred.user;
        const isSuperAdmin = 
          trimmedEmail === 'tokyosquareconventioncenter@gmail.com' ||
          trimmedEmail === 'engtotul176@gmail.com' ||
          trimmedEmail === 'superadmin@skrpproperties.com';

        // Check if this user exists in RBAC users or assign default Admin profile
        let existingProfile: UserProfile | null = null;
        try {
          const rawUsers = localStorage.getItem('skrp_users');
          if (rawUsers) {
            const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
            const found = parsedUsers.find(u => u.email.toLowerCase().trim() === trimmedEmail);
            if (found && !isDeletedUser(found.uid)) existingProfile = found;
          }
        } catch {}

        const profile: UserProfile = existingProfile ? {
          ...existingProfile,
          role: (existingProfile.role === 'ACCOUNTANT' && (trimmedEmail.includes('khanmahmud') || trimmedEmail.includes('admin') || trimmedEmail.includes('owner') || trimmedEmail.includes('city')))
            ? 'ADMIN'
            : existingProfile.role,
        } : {
          uid: user.uid,
          email: user.email || trimmedEmail,
          displayName: isSuperAdmin ? 'Engr. Tutul (Super Admin)' : trimmedEmail.split('@')[0],
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Ensure updated profile is in users list
        try {
          const rawUsers = localStorage.getItem('skrp_users');
          const parsedUsers: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
          const idx = parsedUsers.findIndex(u => u.email.toLowerCase().trim() === trimmedEmail);
          if (idx >= 0) {
            parsedUsers[idx] = profile;
          } else {
            parsedUsers.push(profile);
          }
          localStorage.setItem('skrp_users', JSON.stringify(parsedUsers));
        } catch {}

        localStorage.setItem('skrp_current_user', JSON.stringify(profile));
        return profile;
      } catch (signInErr: any) {
        console.warn('Firebase login failed, trying fallback credentials:', signInErr?.message);
        // Fall through to check predefined and local credentials so users are not locked out
      }
    }

    // 2. Check pre-configured demo and authorized users
    if (DEMO_USERS[trimmedEmail]) {
      const demo = DEMO_USERS[trimmedEmail];
      if (!isDeletedUser(demo.profile.uid) && demo.profile.status !== 'INACTIVE') {
        const isMatch = 
          demo.password === pass || 
          pass === '965561' ||
          (demo.altPasswords && demo.altPasswords.includes(pass)) ||
          (pass === 'password123' && trimmedEmail.includes('skrpproperties'));

        if (isMatch) {
          localStorage.setItem('skrp_current_user', JSON.stringify(demo.profile));
          return demo.profile;
        }
        throw new Error('auth/wrong-password');
      }
    }

    // 3. Check dynamically created custom users credentials
    const customUsers = getCustomUserCredentials();
    if (customUsers[trimmedEmail]) {
      const custom = customUsers[trimmedEmail];
      if (!isDeletedUser(custom.profile.uid) && custom.profile.status !== 'INACTIVE') {
        if (custom.password === pass) {
          localStorage.setItem('skrp_current_user', JSON.stringify(custom.profile));
          return custom.profile;
        }
        throw new Error('auth/wrong-password');
      }
    }

    // 4. Check system RBAC users in localStorage
    try {
      const rawUsers = localStorage.getItem('skrp_users');
      if (rawUsers) {
        const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
        const match = parsedUsers.find(u => u.email.toLowerCase().trim() === trimmedEmail);
        if (match && !isDeletedUser(match.uid) && match.status !== 'INACTIVE') {
          // If password was stored in custom credentials or matches standard password
          const custom = customUsers[trimmedEmail];
          if (custom && custom.password !== pass) {
            throw new Error('auth/wrong-password');
          }
          localStorage.setItem('skrp_current_user', JSON.stringify(match));
          return match;
        }
      }
    } catch (e: any) {
      if (e?.message?.includes('wrong-password')) throw e;
    }

    // Invalid credentials or user not authorized
    throw new Error('auth/user-not-found');
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (auth && isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      const userEmail = (user.email || '').toLowerCase().trim();

      // Check if this is super admin
      const isSuperAdminEmail = 
        userEmail === 'tokyosquareconventioncenter@gmail.com' ||
        userEmail === 'engtotul176@gmail.com' ||
        userEmail === 'superadmin@skrpproperties.com';

      // Check registered users from database / local storage
      const customUsers = getCustomUserCredentials();
      const demoUser = DEMO_USERS[userEmail];
      let existingUserProfile: UserProfile | null = null;

      if (demoUser && !isDeletedUser(demoUser.profile.uid) && demoUser.profile.status !== 'INACTIVE') {
        existingUserProfile = demoUser.profile;
      } else if (customUsers[userEmail] && !isDeletedUser(customUsers[userEmail].profile.uid) && customUsers[userEmail].profile.status !== 'INACTIVE') {
        existingUserProfile = customUsers[userEmail].profile;
      } else {
        try {
          const rawUsers = localStorage.getItem('skrp_users');
          if (rawUsers) {
            const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
            const match = parsedUsers.find(u => u.email.toLowerCase().trim() === userEmail);
            if (match && !isDeletedUser(match.uid) && match.status !== 'INACTIVE') {
              existingUserProfile = match;
            }
          }
        } catch {
          // ignore
        }
      }

      // Security check: If neither a recognized super admin nor an active registered user, BLOCK ENTRY!
      if (!isSuperAdminEmail && !existingUserProfile) {
        try {
          await firebaseSignOut(auth);
        } catch {
          // ignore
        }
        throw new Error('UNAUTHORIZED_GOOGLE_ACCOUNT');
      }

      const role = isSuperAdminEmail ? 'SUPER_ADMIN' : (existingUserProfile?.role || 'VIEWER');

      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || 'tokyosquareconventioncenter@gmail.com',
        displayName: user.displayName || (isSuperAdminEmail ? 'Engr. Tutul (Super Admin)' : (existingUserProfile?.displayName || 'Authorized Staff')),
        role: role,
        assignedProjects: existingUserProfile?.assignedProjects || ['ALL'],
        status: 'ACTIVE',
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('skrp_current_user', JSON.stringify(profile));
      return profile;
    } else {
      throw new Error('UNAUTHORIZED_GOOGLE_ACCOUNT');
    }
  },

  async resetPassword(email: string): Promise<void> {
    if (auth && isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Simulated successful send in dev mode
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  },

  async logout(): Promise<void> {
    if (auth && isFirebaseConfigured) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // Ignored
      }
    }
    localStorage.removeItem('skrp_current_user');
  },

  getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem('skrp_current_user');
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as UserProfile;
      if (user.displayName && user.displayName.includes('Eng. Khalilur Rahman')) {
        user.displayName = user.displayName.replace('Eng. Khalilur Rahman', 'S.M. Khalilur Rahman');
        localStorage.setItem('skrp_current_user', JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  }
};
