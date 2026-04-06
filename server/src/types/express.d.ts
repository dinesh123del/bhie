declare global {
  namespace Express {
    interface User {
      userId: string;
      id: string;
      role: 'admin' | 'user' | 'ca';
      plan?: 'free' | 'pro' | 'premium';
      hasPremium?: boolean;
    }
  }
}

export {};
