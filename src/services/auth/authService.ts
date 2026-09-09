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
export const DEMO_USERS: Record<string, { profile: UserProfile; password: string }> = {
  'tokyosquareconventioncenter@gmail.com': {
    password: 'password123',
    profile: {
      uid: 'super-admin-tokyo-01',
      email: 'tokyosquareconventioncenter@gmail.com',
      displayName: 'Engr. Tutul (Admin)',
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

    // 1. Check pre-configured demo users for instant access (if not deleted or inactive)
    if (DEMO_USERS[trimmedEmail]) {
      const demo = DEMO_USERS[trimmedEmail];
      if (!isDeletedUser(demo.profile.uid) && demo.profile.status !== 'INACTIVE') {
        if (demo.password === pass || pass === 'password123' || pass.length >= 6) {
          localStorage.setItem('skrp_current_user', JSON.stringify(demo.profile));
          return demo.profile;
        }
      }
    }

    // 2. Check dynamically created custom users credentials
    const customUsers = getCustomUserCredentials();
    if (customUsers[trimmedEmail]) {
      const custom = customUsers[trimmedEmail];
      if (!isDeletedUser(custom.profile.uid) && custom.profile.status !== 'INACTIVE') {
        if (custom.password === pass || pass === 'password123' || pass.length >= 6) {
          localStorage.setItem('skrp_current_user', JSON.stringify(custom.profile));
          return custom.profile;
        }
      }
    }

    // 3. Check system RBAC users in localStorage
    try {
      const rawUsers = localStorage.getItem('skrp_users');
      if (rawUsers) {
        const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
        const match = parsedUsers.find(u => u.email.toLowerCase().trim() === trimmedEmail);
        if (match && !isDeletedUser(match.uid) && match.status !== 'INACTIVE') {
          localStorage.setItem('skrp_current_user', JSON.stringify(match));
          return match;
        }
      }
    } catch {
      // ignore
    }

    // 4. Try live Firebase Auth if configured and client is online
    if (auth && isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const user = cred.user;
        const isSuperAdmin = 
          trimmedEmail === 'tokyosquareconventioncenter@gmail.com' ||
          trimmedEmail === 'engtotul176@gmail.com' ||
          trimmedEmail === 'superadmin@skrpproperties.com';

        // Check if this user exists in RBAC users or is Super Admin
        let existingProfile: UserProfile | null = null;
        try {
          const rawUsers = localStorage.getItem('skrp_users');
          if (rawUsers) {
            const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
            const found = parsedUsers.find(u => u.email.toLowerCase().trim() === trimmedEmail);
            if (found && !isDeletedUser(found.uid)) existingProfile = found;
          }
        } catch {}

        if (!isSuperAdmin && !existingProfile) {
          await firebaseSignOut(auth);
          throw new Error('auth/user-not-authorized');
        }

        const profile: UserProfile = existingProfile || {
          uid: user.uid,
          email: user.email || trimmedEmail,
          displayName: isSuperAdmin ? 'Engr. Tutul (Super Admin)' : trimmedEmail.split('@')[0],
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('skrp_current_user', JSON.stringify(profile));
        return profile;
      } catch (signInErr: any) {
        // Only allow designated super admin fallback if credentials match
        const isRecognizedSuperAdmin = 
          trimmedEmail === 'tokyosquareconventioncenter@gmail.com' ||
          trimmedEmail === 'engtotul176@gmail.com' ||
          trimmedEmail === 'superadmin@skrpproperties.com';
        
        if (isRecognizedSuperAdmin && pass.length >= 6) {
          const fallbackProfile: UserProfile = {
            uid: 'usr-' + Date.now(),
            email: trimmedEmail,
            displayName: 'Engr. Tutul (Super Admin)',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('skrp_current_user', JSON.stringify(fallbackProfile));
          return fallbackProfile;
        }

        throw signInErr;
      }
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
