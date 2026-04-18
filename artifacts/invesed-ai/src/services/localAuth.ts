export interface LocalUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  isGoogleUser?: boolean;
}

interface StoredUser extends LocalUser {
  passwordHash: string;
}

const USERS_KEY = 'invesed_ai_users';
const SESSION_KEY = 'invesed_ai_session';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateUID(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export type AuthStateCallback = (user: LocalUser | null) => void;

let listeners: AuthStateCallback[] = [];
let currentUser: LocalUser | null = getSession();

function notifyListeners(user: LocalUser | null) {
  currentUser = user;
  listeners.forEach(cb => cb(user));
}

export const localAuth = {
  getCurrentUser(): LocalUser | null {
    return currentUser;
  },

  onAuthStateChanged(callback: AuthStateCallback): () => void {
    listeners.push(callback);
    // Fire immediately
    setTimeout(() => callback(currentUser), 0);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  async createUserWithEmailAndPassword(email: string, password: string): Promise<LocalUser> {
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const user: StoredUser = {
      uid: generateUID(),
      email: email.toLowerCase().trim(),
      displayName: null,
      photoURL: null,
      createdAt: Date.now(),
      passwordHash: simpleHash(password),
    };

    users.push(user);
    saveUsers(users);

    const publicUser: LocalUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
    };

    saveSession(publicUser);
    notifyListeners(publicUser);
    return publicUser;
  },

  async signInWithEmailAndPassword(email: string, password: string): Promise<LocalUser> {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      throw new Error('No account found with this email address.');
    }
    if (user.passwordHash !== simpleHash(password)) {
      throw new Error('Incorrect password. Please try again.');
    }

    const publicUser: LocalUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
    };

    saveSession(publicUser);
    notifyListeners(publicUser);
    return publicUser;
  },

  async signInWithGoogle(): Promise<LocalUser> {
    // Simulate Google sign-in with a mock user
    const mockEmails = ['student@gmail.com', 'teensaver@gmail.com', 'investkid@gmail.com'];
    const mockNames = ['Arjun Student', 'Priya Learner', 'Dev Investor'];
    const idx = Math.floor(Math.random() * mockEmails.length);

    const users = getUsers();
    let user = users.find(u => u.email === mockEmails[idx]);

    if (!user) {
      user = {
        uid: generateUID(),
        email: mockEmails[idx],
        displayName: mockNames[idx],
        photoURL: null,
        createdAt: Date.now(),
        passwordHash: '',
        isGoogleUser: true,
      };
      users.push(user);
      saveUsers(users);
    }

    const publicUser: LocalUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      isGoogleUser: true,
    };

    saveSession(publicUser);
    notifyListeners(publicUser);
    return publicUser;
  },

  async signOut(): Promise<void> {
    saveSession(null);
    notifyListeners(null);
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('No account found with this email.');
    }
    // In a real app this would send an email — here we just succeed silently
  },
};
