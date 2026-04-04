declare global {
  namespace Express {
    interface User {
      userId: string;
      id: string;
      role: 'admin' | 'user';
      plan?: 'free' | '59' | '119';
      hasPremium?: boolean;
    }
  }
}

export {};
